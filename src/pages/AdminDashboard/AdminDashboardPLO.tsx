import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { Button, Menu, Table, Tabs } from "@mantine/core";
import Icon from "@/components/Icon";
import IconDots from "@/assets/icons/dots.svg?react";
import IconExcel from "@/assets/icons/excel.svg?react";
import IconPLO from "@/assets/icons/PLOdescription.svg?react";
import { useSearchParams } from "react-router-dom";
import { getCourse } from "@/services/course/course.service";
import { CourseRequestDTO } from "@/services/course/dto/course.dto";
import { IModelAcademicYear } from "@/models/ModelAcademicYear";
import notFoundImage from "@/assets/image/notFound.jpg";
import Loading from "@/components/Loading/Loading";
import { setLoading } from "@/store/loading";
import { setShowNavbar, setShowSidebar } from "@/store/config";
import { setAllCourseList } from "@/store/allCourse";
import { IModelPLO, IModelPLONo } from "@/models/ModelPLO";
import ModalExportPLO from "@/components/Modal/ModalExportPLO";
import { getPLOs } from "@/services/plo/plo.service";
import DrawerPLOdes from "@/components/DrawerPLO";
import {
  findMostDuplicateCurriculum,
  getUniqueInstructors,
  getUniqueTopicsWithTQF,
} from "@/helpers/functions/function";
import { COURSE_TYPE } from "@/helpers/constants/enum";
import { IModelTQF3 } from "@/models/ModelTQF3";
import { IModelTQF5 } from "@/models/ModelTQF5";
import PLOSelectCourseView from "@/components/Modal/PLOAdmin/PLOSelectCourseView";
import PLOYearView from "@/components/Modal/PLOAdmin/PLOYearView";

export type PloScore = {
  plo: IModelPLONo;
  courses: CoursePloScore[];
};

export type CoursePloScore = {
  courseNo: string;
  courseName: string;
  curriculum?: string;
  topic?: string;
  avgScore: number;
};

export default function AdminDashboardPLO() {
  const loading = useAppSelector((state) => state.loading.loading);
  const user = useAppSelector((state) => state.user);
  const academicYear = useAppSelector((state) => state.academicYear);
  const courseList = useAppSelector((state) => state.allCourse);
  const dispatch = useAppDispatch();
  const [payload, setPayload] = useState<any>();
  const [params, setParams] = useSearchParams({});
  const [term, setTerm] = useState<Partial<IModelAcademicYear>>({});
  const [ploList, setPloList] = useState<IModelPLO[]>([]);
  const [selectTab, setSelectTab] = useState<string | null>("ploView");
  const [curriculumPLO, setCurriculumPLO] = useState<Partial<IModelPLO>>({});
  const [ploScores, setPloScores] = useState<PloScore[]>([]);
  const [openDrawerPLOdes, setOpenDrawerPLOdes] = useState(false);
  const [openModalExportPLO, setOpenModalExportPLO] = useState(false);
  const [openPLOYearView, setOpenPLOYearView] = useState(false);
  const [openPLOSelectCourseView, setOpenPLOSelectCourseView] = useState(false);

  useEffect(() => {
    dispatch(setShowSidebar(true));
    dispatch(setShowNavbar(true));
  }, []);

  useEffect(() => {
    const year = parseInt(params.get("year")!);
    const semester = parseInt(params.get("semester")!);
    if (academicYear.length) {
      const acaYear = academicYear.find(
        (e) => e.semester == semester && e.year == year
      );
      if (acaYear && acaYear.id != term.id) {
        setTerm(acaYear);
        fetchPLOList(acaYear.year, acaYear.semester);
      }
    }
  }, [academicYear, term, params]);

  useEffect(() => {
    if (term.id) {
      fetchCourse();
    }
  }, [term]);

  useEffect(() => {
    if (term) {
      setPayload({
        ...new CourseRequestDTO(),
        manage: true,
        year: term.year,
        semester: term.semester,
        search: courseList.search,
        hasMore: courseList.total >= payload?.limit,
      });
      localStorage.removeItem("search");
    }
  }, [localStorage.getItem("search")]);

  useEffect(() => {
    if (curriculumPLO.id && courseList.courses.length) {
      calculatePloScores();
    }
  }, [courseList, curriculumPLO]);

  const fetchPLOList = async (year: number, semester: number) => {
    const res = await getPLOs({ year, semester });
    if (res) {
      setPloList([...res.plos]);
      setCurriculumPLO(res.plos[0]);
    }
  };

  const initialPayload = () => {
    return {
      ...new CourseRequestDTO(),
      manage: true,
      ploRequire: true,
      year: term.year!,
      semester: term.semester!,
      search: courseList.search,
      ignorePage: true,
    };
  };

  const fetchCourse = async () => {
    if (!user.termsOfService) return;
    dispatch(setLoading(true));
    const payloadCourse = initialPayload();
    setPayload(payloadCourse);
    const res = await getCourse(payloadCourse);
    if (res) {
      dispatch(setAllCourseList(res));
      setPayload({
        ...payloadCourse,
        hasMore: res.totalCount >= payload.limit,
      });
    }
    dispatch(setLoading(false));
  };

  const filterCoursesForPLO = (plo: Partial<IModelPLO>, item: any) => {
    return courseList.courses.filter((course) => {
      const hasPloRequirement = course.ploRequire?.some(
        (e) => e.plo == plo.id && e.list.includes(item.id)
      );
      const hasSectionPlo = course.sections.some(
        (sec) =>
          sec.curriculum &&
          plo.curriculum?.includes(sec.curriculum) &&
          sec.ploRequire?.some(
            (e) => e.plo == plo.id && e.list.includes(item.id)
          )
      );
      return hasPloRequirement || hasSectionPlo;
    });
  };

  const calculatePloScores = () => {
    const updatedPloScores: PloScore[] = curriculumPLO.data!.map((item) => {
      const coursesForPLO = filterCoursesForPLO(curriculumPLO, item);
      const courseScores: CoursePloScore[] = coursesForPLO.flatMap((course) => {
        if (course.type == COURSE_TYPE.SEL_TOPIC.en) {
          return getUniqueTopicsWithTQF(course.sections!)
            .map((sec) => {
              const clos = sec.TQF3?.part7?.data
                .filter(({ plos }) => (plos as string[]).includes(item.id))
                .map(({ clo }) => clo);
              const sum = clos?.length
                ? sec.TQF5?.part3?.data
                    .filter(({ clo }) => clos?.includes(clo))
                    .reduce((a, b) => a + b.score, 0)
                : undefined;
              return sum !== undefined
                ? {
                    courseNo: course.courseNo,
                    courseName: course.courseName,
                    curriculum: findMostDuplicateCurriculum(course),
                    topic: sec.topic,
                    avgScore: sum / (clos?.length ?? 1),
                  }
                : null;
            })
            .filter((c) => c !== null);
        } else {
          const clos = course.TQF3?.part7?.data
            .filter(({ plos }) => (plos as string[]).includes(item.id))
            .map(({ clo }) => clo);
          const sum = clos?.length
            ? course.TQF5?.part3?.data
                .filter(({ clo }) => clos?.includes(clo))
                .reduce((a, b) => a + b.score, 0)
            : undefined;
          return sum !== undefined
            ? [
                {
                  courseNo: course.courseNo,
                  courseName: course.courseName,
                  curriculum: findMostDuplicateCurriculum(course),
                  avgScore: sum / (clos?.length ?? 1),
                },
              ]
            : [];
        }
      });
      return { plo: item, courses: courseScores };
    });
    setPloScores(updatedPloScores);
  };

  const ploView = (plo: IModelPLO) => {
    return (
      <Table stickyHeader striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>PLO</Table.Th>
            <Table.Th>Course no.</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>AVG. PLO</Table.Th>
            <Table.Th>Instructor</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody className="text-default font-medium text-[13px]">
          {plo.data.map((item, index) => {
            const coursesForPLO = filterCoursesForPLO(plo, item);
            let rowSpan = 0;
            coursesForPLO.forEach((course) => {
              if (course.type === COURSE_TYPE.SEL_TOPIC.en) {
                const uniqueTopics = getUniqueTopicsWithTQF(course.sections!);
                rowSpan += uniqueTopics.length;
              } else {
                rowSpan += 1;
              }
            });
            const coursePlo = ploScores.find(
              (p) => p.plo.id == item.id
            )?.courses;
            return coursesForPLO.length > 0 ? (
              coursesForPLO.map((course, courseIndex) => {
                const insList = getUniqueInstructors(course.sections!);
                const uniqueTopics = getUniqueTopicsWithTQF(course.sections!);
                let ploScore = coursePlo?.find(
                  ({ courseNo }) => courseNo == course.courseNo
                )?.avgScore;
                return course.type === COURSE_TYPE.SEL_TOPIC.en ? (
                  uniqueTopics.map((sec, topicIndex) => {
                    ploScore = coursePlo?.find(
                      ({ courseNo, topic }) =>
                        courseNo == course.courseNo && topic == sec.topic
                    )?.avgScore;
                    return (
                      <Table.Tr
                        key={`${item.id}-${course.courseNo}-${sec.topic}`}
                      >
                        {topicIndex === 0 && courseIndex === 0 && (
                          <Table.Td
                            className="border-r !border-[#cecece]"
                            rowSpan={rowSpan}
                          >
                            <div>
                              <p>
                                {item.no}. {item.descTH}
                              </p>
                              <p>{item.descEN}</p>
                            </div>
                          </Table.Td>
                        )}
                        {topicIndex === 0 && (
                          <Table.Td
                            className="border-r !border-[#cecece]"
                            rowSpan={uniqueTopics.length}
                          >
                            {course.courseNo}
                          </Table.Td>
                        )}
                        <Table.Td>
                          <div>
                            <p>{course.courseName}</p>
                            {sec && <p>({sec.topic})</p>}
                          </div>
                        </Table.Td>
                        <Table.Td>{ploScore?.toFixed(2) ?? "-"}</Table.Td>
                        <Table.Td>
                          {insList.map((ins, index1) => {
                            return (
                              <div
                                key={`${sec.topic}${index1}`}
                                className="flex flex-col"
                              >
                                <p>{ins}</p>
                              </div>
                            );
                          })}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                ) : (
                  <Table.Tr key={`${item.id}-${course.courseNo}`}>
                    {courseIndex === 0 && (
                      <Table.Td
                        className="border-r !border-[#cecece]"
                        rowSpan={rowSpan}
                      >
                        <div>
                          <p>
                            {item.no}. {item.descTH}
                          </p>
                          <p>{item.descEN}</p>
                        </div>
                      </Table.Td>
                    )}
                    <Table.Td className="border-r !border-[#cecece]">
                      {course.courseNo}
                    </Table.Td>
                    <Table.Td>{course.courseName}</Table.Td>
                    <Table.Td>{ploScore?.toFixed(2) ?? "-"}</Table.Td>
                    <Table.Td>
                      {insList.map((ins, index1) => {
                        return (
                          <div
                            key={`${index}-${index1}`}
                            className="flex flex-col"
                          >
                            <p>{ins}</p>
                          </div>
                        );
                      })}
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr key={item.id}>
                <Table.Td className="border-r !border-[#cecece]">
                  <div>
                    <p>
                      {item.no}. {item.descTH}
                    </p>
                    <p>{item.descEN}</p>
                  </div>
                </Table.Td>
                <Table.Td className="border-r !border-[#cecece]">-</Table.Td>
                <Table.Td>-</Table.Td>
                <Table.Td>-</Table.Td>
                <Table.Td>-</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    );
  };

  const courseView = (plo: IModelPLO) => {
    const ploScores = (
      ploRequire: string[],
      tqf3: IModelTQF3,
      tqf5: IModelTQF5
    ) => {
      return plo.data.map((item) => {
        // if (!ploRequire?.includes(item.id)) {
        //   return <Table.Th key={item.id}>-</Table.Th>;
        // }
        const clos = tqf3.part7?.data
          .filter(({ plos }) => (plos as string[]).includes(item.id))
          .map(({ clo }) => clo);
        const sum = clos?.length
          ? tqf5.part3?.data
              .filter(({ clo }) => clos?.includes(clo))
              .reduce((a, b) => a + b.score, 0)
          : undefined;
        const score = sum ? sum / (clos?.length ?? 1) : undefined;
        return <Table.Th key={item.id}>{score?.toFixed(2) ?? "-"}</Table.Th>;
      });
    };
    return (
      <Table stickyHeader striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Course no.</Table.Th>
            <Table.Th>Name</Table.Th>
            {plo.data.map((item) => (
              <Table.Th key={item.id}>PLO-{item.no}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody className="text-default font-medium text-[13px]">
          {courseList.courses
            .filter((course) =>
              course.sections.some(
                ({ curriculum }) =>
                  curriculum && plo.curriculum.includes(curriculum)
              )
            )
            .map((course, index) => {
              const uniqueTopic = getUniqueTopicsWithTQF(course.sections!);
              return course.type == COURSE_TYPE.SEL_TOPIC.en ? (
                uniqueTopic.map((sec, indexSec) => {
                  return (
                    <Table.Tr key={`${course.courseNo}${sec.topic}${index}`}>
                      {indexSec == 0 && (
                        <Table.Td
                          className="border-r !border-[#cecece]"
                          rowSpan={uniqueTopic.length}
                        >
                          {course.courseNo}
                        </Table.Td>
                      )}
                      <Table.Td>
                        <div>
                          <p>{course.courseName}</p>
                          {sec && <p>({sec.topic})</p>}
                        </div>
                      </Table.Td>
                      {ploScores(
                        sec.ploRequire?.find((e) => e.plo == plo.id)
                          ?.list as string[],
                        sec.TQF3!,
                        sec.TQF5!
                      )}
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr key={index}>
                  <Table.Td className="border-r !border-[#cecece]">
                    {course.courseNo}
                  </Table.Td>
                  <Table.Td>{course.courseName}</Table.Td>
                  {ploScores(
                    course.ploRequire?.find((e) => e.plo == plo.id)
                      ?.list as string[],
                    course.TQF3!,
                    course.TQF5!
                  )}
                </Table.Tr>
              );
            })}
        </Table.Tbody>
      </Table>
    );
  };

  return (
    <>
      {curriculumPLO && (
        <DrawerPLOdes
          opened={openDrawerPLOdes}
          onClose={() => setOpenDrawerPLOdes(false)}
          data={curriculumPLO}
        />
      )}
      <ModalExportPLO
        opened={openModalExportPLO}
        onClose={() => setOpenModalExportPLO(false)}
        data={ploScores}
      />
      <PLOSelectCourseView
      opened={openPLOSelectCourseView}
      onClose={() => setOpenPLOSelectCourseView(false)}
      />
      <PLOYearView 
      opened={openPLOYearView}
      onClose={() => setOpenPLOYearView(false)} />
      <div className=" flex flex-col h-full w-full gap-2 overflow-hidden">
        <div className="flex flex-row px-6 pt-3 items-center justify-between">
          <div className="flex flex-col">
            <p className="text-secondary text-[18px] font-semibold ">
              Hi there, {user.firstNameEN}
            </p>
            {courseList.search.length ? (
              <p className="text-[#575757] text-[14px]">
                {courseList.total} result{courseList.total > 1 ? "s " : " "}{" "}
                found
              </p>
            ) : (
              <p className="text-[#575757] text-[14px]">
                In semester{" "}
                <span className="text-[#1f69f3] font-semibold">
                  {" "}
                  {term?.semester ?? ""}/{term?.year ?? ""}!
                </span>{" "}
                {courseList.courses.length === 0 ? (
                  <span>Course is currently empty</span>
                ) : (
                  <span>
                    You have{" "}
                    <span className="text-[#1f69f3] font-semibold">
                      {courseList.total} Course
                      {courseList.total > 1 ? "s " : " "}
                    </span>
                    on your plate.
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              color="#e9e9e9"
              className="text-center px-4 !text-default"
              onClick={() => setOpenDrawerPLOdes(true)}
            >
              <div className="flex gap-2">
                <Icon IconComponent={IconPLO} />
                PLO Description
              </div>
            </Button>

            <Menu trigger="click" position="bottom-end">
              <Menu.Target>
                <div className="rounded-full hover:bg-gray-300 p-1 cursor-pointer">
                  <Icon IconComponent={IconDots} />
                </div>
              </Menu.Target>
              <Menu.Dropdown
                className="rounded-md translate-y-1 backdrop-blur-xl bg-white"
                style={{
                  boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                <Menu.Item onClick={() => setOpenPLOYearView(true)} className=" text-[#3e3e3e] mb-[2px] font-semibold text-b4 h-7  acerSwift:max-macair133:!text-b5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2 items-center acerSwift:max-macair133:text-b5">
                      <span className="pr-10"> Year View </span>
                    </div>{" "}
                  </div>
                </Menu.Item>
                <Menu.Item onClick={() => setOpenPLOSelectCourseView(true)} className=" text-[#3e3e3e] mb-[2px] font-semibold text-b4 h-7  acerSwift:max-macair133:!text-b5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2 items-center acerSwift:max-macair133:text-b5">
                      <span className="pr-10">Academic View </span>
                    </div>{" "}
                  </div>
                </Menu.Item>

                <Menu.Item
                  onClick={() => setOpenModalExportPLO(true)}
                  className=" text-[#20884f] hover:bg-[#06B84D]/10 font-semibold text-b4 acerSwift:max-macair133:!text-b5 h-7 "
                >
                  <div className="flex items-center  gap-2">
                    <Icon
                      className="size-4 acerSwift:max-macair133:!size-3.5"
                      IconComponent={IconExcel}
                    />
                    <span>Export PLO</span>
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
        <div className="flex h-full w-full px-6 pb-3 overflow-hidden">
          {loading ? (
            <Loading />
          ) : ploList.length ? (
            <Tabs
              classNames={{
                root: "flex flex-col w-full",
              }}
              defaultValue={ploList[0].id}
              onChange={(event) =>
                setCurriculumPLO(ploList.find(({ id }) => id == event) || {})
              }
            >
              <Tabs.List className="mb-2 flex flex-nowrap overflow-x-auto">
                {ploList.map((plo) => (
                  <Tabs.Tab key={plo.id} value={plo.id}>
                    {plo.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {ploList.map((plo) => (
                <Tabs.Panel
                  key={plo.id}
                  className="flex flex-col h-full w-full overflow-hidden gap-1"
                  value={plo.id}
                >
                  <Tabs
                    classNames={{
                      root: "flex flex-col h-full w-full",
                    }}
                    value={selectTab}
                    onChange={setSelectTab}
                  >
                    <Tabs.List className="mb-2">
                      <Tabs.Tab value="ploView">PLO</Tabs.Tab>
                      <Tabs.Tab value="courseView">Course</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel
                      className="flex flex-col h-full w-full overflow-auto gap-1"
                      value={selectTab || "ploView"}
                    >
                      {selectTab == "ploView" || courseList.courses.length ? (
                        <div className="overflow-y-auto overflow-x-auto w-full h-fit max-h-full border flex flex-col rounded-lg border-secondary">
                          {selectTab == "ploView"
                            ? ploView(plo)
                            : courseView(plo)}
                        </div>
                      ) : (
                        <div className=" flex flex-row px-[75px] flex-1 justify-between">
                          <div className="h-full  justify-center flex flex-col">
                            <p className="text-secondary text-[22px] font-semibold">
                              {courseList.search.length
                                ? `No results for "${courseList.search}" `
                                : "No Course Found"}
                            </p>
                            <br />
                            <p className=" -mt-4 mb-6 text-b2 break-words font-medium leading-relaxed">
                              {courseList.search.length ? (
                                <>Check the spelling or try a new search.</>
                              ) : (
                                <>
                                  It looks like you haven't added any courses
                                  yet.
                                </>
                              )}
                            </p>
                          </div>
                          <div className="h-full  w-[24vw] justify-center flex flex-col">
                            <img src={notFoundImage} alt="notFound"></img>
                          </div>
                        </div>
                      )}
                    </Tabs.Panel>
                  </Tabs>
                </Tabs.Panel>
              ))}
            </Tabs>
          ) : (
            <div className=" flex flex-row px-[75px] flex-1 justify-between">
              <div className="h-full  justify-center flex flex-col">
                <p className="text-secondary text-[22px] font-semibold">
                  No PLO Found
                </p>
                <br />
                <p className=" -mt-4 mb-6 text-b2 break-words font-medium leading-relaxed">
                  It looks like admin haven't added any PLO yet.
                </p>
              </div>
              <div className="h-full  w-[24vw] justify-center flex flex-col">
                <img src={notFoundImage} alt="notFound"></img>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
