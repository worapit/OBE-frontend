import {
  Button,
  Checkbox,
  Chip,
  Group,
  Modal,
  Switch,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  validateCourseNameorTopic,
  validateSectionNo,
} from "@/helpers/functions/validation";
import { showNotifications } from "@/helpers/functions/function";
import { useAppDispatch, useAppSelector } from "@/store";
import { IModelSection } from "@/models/ModelSection";
import { updateSection } from "@/services/section/section.service";
import { IModelSectionManagement } from "@/models/ModelCourseManagement";
import { COURSE_TYPE, NOTI_TYPE, SEMESTER } from "@/helpers/constants/enum";
import {
  getOneCourseManagement,
  updateSectionManagement,
} from "@/services/courseManagement/courseManagement.service";
import { editSectionManagement } from "@/store/courseManagement";
import { editSection } from "@/store/course";
import { isEqual } from "lodash";

type Props = {
  opened: boolean;
  onClose: () => void;
  isCourseManage?: boolean;
  title?: string;
  value:
    | (Partial<IModelSection | IModelSectionManagement> & Record<string, any>)
    | undefined;
};

export default function ModalEditSection({
  opened,
  onClose,
  isCourseManage = false,
  title,
  value,
}: Props) {
  const academicYear = useAppSelector((state) => state.academicYear[0]);
  const dispatch = useAppDispatch();
  const [openThisTerm, setOpenThisTerm] = useState(false);
  const [semester, setSemester] = useState<string[]>([]);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {} as Partial<IModelSection | IModelSectionManagement> &
      Record<string, any>,
    validate: {
      topic: (value) => validateCourseNameorTopic(value, "Topic"),
      sectionNo: (value) => validateSectionNo(value),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const fetchCourseManagement = async () => {
      const res = await getOneCourseManagement(value?.courseNo);
      if (res && value) {
        setSemester(
          res.sections
            .find((sec: any) => sec.sectionNo == value?.oldSectionNo)
            .semester.map((sec: any) => sec.toString())
        );
      }
    };

    if (opened && value) {
      form.setValues(value.data);
      setOpenThisTerm(
        (value.isActive &&
          (value.data.semester as string[])?.includes(
            academicYear.semester.toString()
          )) ??
          false
      );
      if (value.data.semester) setSemester(value.data.semester as string[]);
      if (!isCourseManage) fetchCourseManagement();
    } else {
      form.reset();
      setOpenThisTerm(false);
      setSemester([]);
    }
  }, [opened, value]);

  useEffect(() => {
    if (openThisTerm && !semester.includes(academicYear.semester.toString())) {
      semester.push(academicYear.semester.toString());
      semester.sort();
    }
  }, [openThisTerm]);

  const submit = async () => {
    let payload: any = { ...value, data: {} };
    if (value?.type == COURSE_TYPE.SEL_TOPIC) {
      payload.data.topic = form.getValues().topic;
    }
    payload.data.sectionNo = parseInt(form.getValues().sectionNo?.toString()!);
    payload.data.semester = semester.map((term) => parseInt(term));
    const id = payload.id;
    delete payload.id;
    let res;
    if (isCourseManage) {
      const secId = payload.secId;
      delete payload.secId;
      res = await updateSectionManagement(id!, secId, payload);
      if (res) {
        dispatch(editSectionManagement({ id, secId, data: payload.data }));
        dispatch(
          editSection({
            id: res.courseId,
            secId: res.secId,
            data: payload.data,
          })
        );
      }
    } else {
      res = await updateSection(id!, payload);
      if (res) {
        dispatch(
          editSection({
            id: payload.courseId,
            secId: id,
            data: payload.data,
          })
        );
      }
    }
    if (res) {
      console.log(payload.data.sectionNo);
      console.log(value?.sectionNo);
      
      setOpenThisTerm(false);
      setSemester([]);
      showNotifications(
        NOTI_TYPE.SUCCESS,
        "Edit success",
        `${
          payload.data.sectionNo !== value?.oldSectionNo ?
          "Section no." : ''
        } ${payload.data.topic !== value?.data.topic ? "Section topic" : ''} is edited`
      );
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      title={title ?? "Edit section"}
      size="35vw"
      centered
      transitionProps={{ transition: "pop" }}
      classNames={{
        content:
          "flex flex-col justify-start bg-[#F6F7FA] text-[14px] item-center  overflow-hidden ",
      }}
    >
      <div className="flex flex-col mt-2 gap-5">
        {value?.type === COURSE_TYPE.SEL_TOPIC && (
          <TextInput
            label="Topic"
            withAsterisk
            size="xs"
            classNames={{ input: "focus:border-primary" }}
            {...form.getInputProps("topic")}
          />
        )}
        <TextInput
          label="Section"
          withAsterisk
          size="xs"
          maxLength={3}
          classNames={{ input: "focus:border-primary" }}
          {...form.getInputProps("sectionNo")}
        />
        <div
          style={{
            boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
          className={`w-full pl-5 pr-[18px] py-[18px] bg-white  rounded-md gap-2 flex flex-col`}
        >
          <div className={`flex flex-row justify-between items-center`}>
            <div className="gap-3 flex flex-col">
              <span className="font-semibold text-[13px] text-[#333333]">
                Repeat on semester
              </span>
            </div>
            <Chip.Group
              value={semester}
              onChange={(event) => setSemester(event.sort())}
              multiple
            >
              <Group className="flex flex-row gap-4 justify-end">
                {SEMESTER.map((item) => (
                  <Chip
                    icon={<></>}
                    key={item}
                    classNames={{
                      input:
                        "bg-black bg-opacity-0 border-[1.5px] border-[#3E3E3E] cursor-pointer disabled:bg-gray-400",
                      iconWrapper: "w-0",
                      label: "text-[14px] px-4 cursor-pointer",
                    }}
                    color="#5768D5"
                    size="xs"
                    value={item.toString()}
                    disabled={
                      (openThisTerm &&
                        item == academicYear.semester &&
                        semester.includes(item.toString())) ||
                      (semester.length == 1 &&
                        semester.includes(item.toString()))
                    }
                  >
                    {item}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </div>
        </div>
        <div
          style={{
            boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
          className={`w-full pl-5 pr-[18px] py-4 bg-white mb-3 rounded-md gap-2 flex flex-col`}
        >
          <div className={`flex flex-row justify-between items-center`}>
            <div className="gap-3 flex flex-col">
              <span className="font-semibold text-[13px] text-[#333333]">
                Open in {academicYear?.semester}/{academicYear?.year}
              </span>
            </div>
            <Switch
              color="#5768d5"
              size="lg"
              onLabel="ON"
              offLabel="OFF"
              checked={openThisTerm}
              onChange={(event) => setOpenThisTerm(event.target.checked)}
            ></Switch>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full">
          <Button
            color="#575757"
            variant="subtle"
            className="rounded-[8px] text-[12px] h-[32px] w-fit "
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            className="rounded-[8px] text-[12px] h-[32px] w-fit "
            color="#5768d5"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
