import { Button, Table, Textarea, TextInput } from "@mantine/core";
import Icon from "../Icon";
import IconUpload from "@/assets/icons/upload.svg?react";
import IconEdit from "@/assets/icons/edit.svg?react";
import IconCheck2 from "@/assets/icons/Check2.svg?react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IModelTQF5Part1 } from "@/models/ModelTQF5";
import ModalUploadGrade from "../Modal/Score/ModalUploadGrade";
import { cloneDeep, isEqual } from "lodash";
import { updatePartTQF5 } from "@/store/tqf5";
import { getSectionNo } from "@/helpers/functions/function";
import { IModelUser } from "@/models/ModelUser";
import { ROLE } from "@/helpers/constants/enum";

type Props = {
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function Part1TQF5({ setForm }: Props) {
  const { courseNo } = useParams();
  const user = useAppSelector((state) => state.user);
  const dashboard = useAppSelector((state) => state.config.dashboard);
  const course = useAppSelector((state) =>
    (dashboard == ROLE.ADMIN ? state.allCourse : state.course).courses.find(
      (c) => c.courseNo == courseNo
    )
  );
  const tqf5 = useAppSelector((state) => state.tqf5);
  const dispatch = useAppDispatch();
  const [openModalUploadGrade, setOpenModalUploadGrade] = useState(false);
  const [isEditCourseEval, setIsEditCourseEval] = useState(false);
  const [isEditCriteria, setIsEditCriteria] = useState(false);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      courseEval: course?.sections
        .filter((sec) => sec.isActive && sec.topic == tqf5.topic)
        .map((sec) => ({
          sectionNo: sec.sectionNo,
          A: 0,
          Bplus: 0,
          B: 0,
          Cplus: 0,
          C: 0,
          Dplus: 0,
          D: 0,
          F: 0,
          W: 0,
          S: 0,
          U: 0,
          P: 0,
        })),
      gradingCriteria: {
        A: ">= 80.00",
        Bplus: "75.00 - 79.99",
        B: "70.00 - 74.99",
        Cplus: "65.00 - 69.99",
        C: "60.00 - 64.99",
        Dplus: "55.00 - 59.99",
        D: "50.00 - 54.99",
        F: "0.00 - 49.99",
        W: "-",
        S: "-",
        U: "-",
      },
    } as IModelTQF5Part1,
    validateInputOnBlur: true,
    onValuesChange(values, previous) {
      if (!isEqual(values, previous)) {
        dispatch(
          updatePartTQF5({ part: "part1", data: cloneDeep(form.getValues()) })
        );
        setForm(form);
      }
    },
  });

  const calculateTotals = (courseEval: any[]) => {
    const totals = {
      A: 0,
      Bplus: 0,
      B: 0,
      Cplus: 0,
      C: 0,
      Dplus: 0,
      D: 0,
      F: 0,
      W: 0,
      S: 0,
      U: 0,
      P: 0,
      total: 0,
      avg: 0,
    };
    courseEval?.forEach((item) => {
      Object.keys(totals).forEach((key) => {
        (totals as any)[key] += parseInt(item[key]) || 0;
      });
    });
    totals.total = Object.values(totals).reduce((a, b) => a + (b as number), 0);
    return totals;
  };

  useEffect(() => {
    if (tqf5.part1) {
      form.setValues(cloneDeep(tqf5.part1));
    }
  }, []);

  return (
    <>
      <ModalUploadGrade
        opened={openModalUploadGrade}
        onClose={() => setOpenModalUploadGrade(false)}
        data={course!}
        form={form}
      />

      <div className="flex w-full flex-col text-[15px] acerSwift:max-macair133:text-b1 max-h-full gap-3 text-default px-3">
        <div className="flex text-secondary gap-4 w-full border-b-[1px] border-[#e6e6e6] pb-6 flex-col">
          <div className="flex text-secondary items-center justify-between flex-row gap-1 text-[15px] acerSwift:max-macair133:!text-b3">
            <p className="font-bold">
              Student grading<span className="ml-1 text-red-500">*</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftSection={
                  <Icon IconComponent={IconUpload} className="size-4" />
                }
                onClick={() => setOpenModalUploadGrade(true)}
                className="acerSwift:max-macair133:!text-b5"
              >
                Upload Grade Sheet
              </Button>
              <Button
                leftSection={
                  <Icon
                    IconComponent={isEditCourseEval ? IconCheck2 : IconEdit}
                    className="size-4"
                  />
                }
                color={isEditCourseEval ? "#0eb092" : "#ee933e"}
                onClick={() => setIsEditCourseEval(!isEditCourseEval)}
                className="acerSwift:max-macair133:!text-b5"
              >
                {isEditCourseEval ? "Done" : "Edit Grade"}
              </Button>
            </div>
          </div>
          <div
            className="overflow-x-auto w-full h-fit bg max-h-full border flex flex-col rounded-lg border-secondary"
            style={{
              boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.30)",
            }}
          >
            <Table stickyHeader striped>
              <Table.Thead>
                <Table.Tr className=" border-b-[1px] border-secondary acerSwift:max-macair133:!text-b4 ">
                  <Table.Th
                    className="!rounded-tl-[8px] items-center justify-center  text-center !rounded-tr-[8px] w-full"
                    colSpan={15}
                  >
                    จำนวนนักศึกษา (Number of Students)
                  </Table.Th>
                </Table.Tr>
                <Table.Tr className="acerSwift:max-macair133:!text-b4">
                  <Table.Th className=" w-[10%]">Section</Table.Th>
                  <Table.Th className=" w-[6%]">A</Table.Th>
                  <Table.Th className=" w-[6%]">B+</Table.Th>
                  <Table.Th className=" w-[6%]">B</Table.Th>
                  <Table.Th className=" w-[6%]">C+</Table.Th>
                  <Table.Th className=" w-[6%]">C</Table.Th>
                  <Table.Th className=" w-[6%]">D+</Table.Th>
                  <Table.Th className=" w-[6%]">D</Table.Th>
                  <Table.Th className=" w-[6%]">F</Table.Th>
                  <Table.Th className=" w-[6%]">W</Table.Th>
                  <Table.Th className=" w-[6%]">S</Table.Th>
                  <Table.Th className=" w-[6%]">U</Table.Th>
                  <Table.Th className=" w-[6%]">P</Table.Th>
                  <Table.Th className=" w-[9%]">Total</Table.Th>
                  <Table.Th className=" w-[9%]">Avg</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {form.getValues().courseEval?.map((item, index) => {
                  const section = course?.sections.find(
                    ({ sectionNo }) => sectionNo == item.sectionNo
                  );
                  const canAccess =
                    (section?.instructor as IModelUser).id == user.id ||
                    section?.coInstructors?.find(
                      (coIns) => coIns.id == user.id
                    );
                  const data = Object.values(item)
                    .slice(1)
                    .map((e: any) => parseInt(e));
                  const total = data.reduce((a, b: any) => a + b, 0);
                  const avg =
                    total > 0
                      ? (4 * data[0] +
                          3.5 * data[1] +
                          3 * data[2] +
                          2.5 * data[3] +
                          2 * data[4] +
                          1.5 * data[5] +
                          1 * data[6] +
                          0 * data[7]) /
                        total
                      : 0;
                  return (
                    <Table.Tr
                      className="font-medium text-default text-b3 acerSwift:max-macair133:!text-b4"
                      key={item.sectionNo}
                    >
                      <Table.Td>{getSectionNo(item.sectionNo)}</Table.Td>
                      {!isEditCourseEval &&
                        Object.keys(item)
                          .slice(1)
                          .map((key) => (
                            <Table.Td key={key}>
                              {(item as any)[key] ?? "-"}
                            </Table.Td>
                          ))}
                      {isEditCourseEval &&
                        (canAccess || dashboard == ROLE.ADMIN ? (
                          Object.keys(item)
                            .slice(1)
                            .map((key) => (
                              <Table.Td key={key}>
                                <TextInput
                                  size="xs"
                                  classNames={{
                                    input:
                                      "acerSwift:max-macair133:!text-b5 acerSwift:max-macair133:w-[40px]",
                                  }}
                                  {...form.getInputProps(
                                    `courseEval.${index}.${key}`
                                  )}
                                />
                              </Table.Td>
                            ))
                        ) : (
                          <Table.Td
                            colSpan={12}
                            className="text-error text-center"
                          >
                            cannot edit
                          </Table.Td>
                        ))}
                      <Table.Td>{total}</Table.Td>
                      <Table.Td>{avg.toFixed(2)}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
              <Table.Tfoot className="!bg-bgTableHeader !border-t-[1px] border-secondary sticky bottom-0">
                {(() => {
                  const totals = calculateTotals(form.getValues().courseEval);
                  const avg =
                    totals.total > 0
                      ? (4 * totals.A +
                          3.5 * totals.Bplus +
                          3 * totals.B +
                          2.5 * totals.Cplus +
                          2 * totals.C +
                          1.5 * totals.Dplus +
                          1 * totals.D +
                          0 * totals.F) /
                        totals.total
                      : 0;
                  return (
                    <Table.Tr className="border-none text-secondary font-semibold acerSwift:max-macair133:!text-b4">
                      <Table.Th className="rounded-bl-[8px] w-[10%]">
                        Total
                      </Table.Th>
                      {Object.keys(totals)
                        .slice(0, -1)
                        .map((key) => (
                          <Table.Th key={key}>{(totals as any)[key]}</Table.Th>
                        ))}
                      <Table.Th className="!rounded-br-[8px]">
                        {avg.toFixed(2)}
                      </Table.Th>
                    </Table.Tr>
                  );
                })()}
              </Table.Tfoot>
            </Table>
          </div>
        </div>
        <div className="flex text-secondary gap-4 items-center justify-center w-full border-[#e6e6e6] pb-6 flex-col border-b-[1px] mb-2">
          <div className="flex text-secondary items-center w-full justify-between flex-row gap-1 mt-2 text-[15px] acerSwift:max-macair133:!text-b3">
            <p className="font-bold">
              Grading criteria<span className="ml-1 text-red-500">*</span>
            </p>
            <Button
              leftSection={
                <Icon
                  IconComponent={isEditCriteria ? IconCheck2 : IconEdit}
                  className="size-4"
                />
              }
              color={isEditCriteria ? "#0eb092" : "#ee933e"}
              onClick={() => setIsEditCriteria(!isEditCriteria)}
              className="acerSwift:max-macair133:!text-b5"
            >
              {isEditCriteria ? "Done" : "Edit Criteria"}
            </Button>
          </div>
          <div
            className="h-fit bg max-h-full border items-center justify-center flex flex-col rounded-lg border-secondary overflow-clip"
            style={{
              boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.30)",
            }}
          >
            <Table striped>
              <Table.Thead className="acerSwift:max-macair133:!text-b4">
                <Table.Tr className="bg-[#e5e7f6] border-b-[1px] border-secondary">
                  <Table.Th className=" items-center justify-center text-center min-w-[100px]">
                    Grade
                  </Table.Th>
                  <Table.Th className="items-center justify-center  text-center min-w-[200px]">
                    Score range
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody className="justify-center items-center text-center ">
                {Object.keys(form.getValues().gradingCriteria).map((key) => (
                  <Table.Tr
                    className="font-medium text-default text-b3 acerSwift:max-macair133:!text-b4"
                    key={key}
                  >
                    <Table.Td>{key.replace("plus", "+")}</Table.Td>
                    <Table.Td>
                      {!isEditCriteria ? (
                        (form.getValues().gradingCriteria as any)[key]
                      ) : (
                        <TextInput
                          size="xs"
                          classNames={{
                            input: "acerSwift:max-macair133:!text-b4",
                          }}
                          {...form.getInputProps(`gradingCriteria.${key}`)}
                        />
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
        {/* <div className="w-full border-b-[1px] border-[#e6e6e6] justify-between h-fit  items-top  grid grid-cols-3 pb-5">
          <div className="flex text-secondary flex-col text-[15px] acerSwift:max-macair133:!text-b3">
            <p className="font-semibold">ปัจจัยที่ทำให้ระดับคะแนนผิดปกติ</p>
          </div>
          <div className="flex flex-col gap-3 text-default">
            <Textarea
              label="Description"
              size="xs"
              placeholder="(optional)"
              className="w-[500px]"
              classNames={{
                input: `h-[150px] p-3 acerSwift:max-macair133:!text-b4 `,
                label: "text-default acerSwift:max-macair133:!text-b4",
              }}
            ></Textarea>
          </div>
        </div>
        <div className="w-full justify-between h-fit  items-top  grid grid-cols-3 pt-5 pb-6 border-b-[1px] !-mt-3">
          <div className="flex text-secondary flex-col text-[15px] acerSwift:max-macair133:!text-b3">
            <p className="font-semibold">
              การทวนสอบผลสัมฤทธิ์ของนักศึกษา <br /> (ให้อ้างอิงจาก มคอ. 2 และ 3)
            </p>
          </div>

          <div className="flex flex-col gap-3 text-default ">
            <Textarea
              key={form.key("recDoc")}
              label="Description"
              size="xs"
              placeholder="(optional)"
              className="w-[500px]"
              classNames={{
                input: `h-[150px] p-3 acerSwift:max-macair133:!text-b4`,
                label: "text-default acerSwift:max-macair133:!text-b4",
              }}
            ></Textarea>
          </div>
        </div> */}
      </div>
    </>
  );
}
