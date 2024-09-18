import { useEffect, useState } from "react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Group, Text, rem } from "@mantine/core";
import { Alert, Button, Modal } from "@mantine/core";
import {
  IconBulb,
  IconDownload,
  IconExclamationCircle,
  IconFile,
  IconFileExcel,
  IconFileImport,
  IconInfoCircle,
  IconUpload,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { IModelCourse } from "@/models/ModelCourse";
import gradescope from "@/assets/image/gradescope.png";
import ModalStudentList from "./ModalStudentList";

type Props = {
  opened: boolean;
  onClose: () => void;
  data: Partial<IModelCourse>;
};

export default function ModalUploadScore({ opened, onClose, data }: Props) {
  const [openModalStudentList, setOpenModalStudentList] = useState(false);

  return (
    <>
      <ModalStudentList
        data={data}
        opened={openModalStudentList}
        onClose={() => setOpenModalStudentList(false)}
        type="import"
      />
      {/* Main Modal */}
      <Modal.Root
        opened={opened}
        onClose={onClose}
        autoFocus={false}
        fullScreen={true}
        zIndex={50}
      >
        <Modal.Overlay />
        <Modal.Content className=" pt-0 !rounded-none !px-0">
          <Modal.Header
            style={{
              boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
            className="!pt-4  flex w-full rounded-none   pb-4 !px-0"
          >
            <div className="flex px-12 items-center  justify-between  w-full ">
              <div className="inline-flex  gap-2 items-center font-semibold text-h2 text-secondary">
                <Modal.CloseButton className="!m-0" />
                <div className="flex flex-col">
                  <p>Upload Score </p>
                  <p className=" text-[12px] text-noData">
                    {" "}
                    {data?.courseNo} {data?.courseName}
                  </p>
                </div>
              </div>
              <Button
                leftSection={<IconFileImport className="size-4" />}
                color="#5268d5"
                variant="outline"
                className="w-28"
                onClick={() => setOpenModalStudentList(true)}
              >
                Import student list
              </Button>
            </div>
          </Modal.Header>

          <Modal.Body className="    flex flex-col h-full w-full  ">
            {/* Topic */}
            <div className="flex flex-col gap-3 px-44 py-6 ">
              <Alert
                radius="md"
                variant="light"
                color="red"
                classNames={{
                  body: " flex justify-center",
                }}
                title={
                  <div className="flex items-center  gap-2">
                    <IconExclamationCircle />
                    <p>Important: Score OBE+ required</p>
                  </div>
                }
              >
                <p className="pl-8 text-default font-medium -mt-1">
                  Use only{" "}
                  <span className="  font-extrabold">
                    {" "}
                    Score OBE+ template{" "}
                  </span>
                  provided below to submit your scores. Please read the template
                  guide carefully, then download the template to upload your
                  score.
                </p>
              </Alert>
              <Alert
                radius="md"
                variant="light"
                color="rgba(0, 156, 140, 1)"
                classNames={{
                  body: " flex justify-center",
                }}
                title={
                  <div className="flex items-center  gap-2">
                    <IconBulb />
                    <p>
                      Tips: Score OBE+ support{" "}
                      <span style={{ fontFamily: "Lexand" }}>
                        Gradescope template{" "}
                      </span>
                      for upload score
                    </p>
                  </div>
                }
              >
                <div className="flex items-center mt-2 mb-2">
                  <img
                    src={gradescope}
                    alt="CMULogo"
                    className=" h-[35px] ml-8  w-[156px] "
                  />
                  <p className="pl-8 text-default font-medium leading-[22px]">
                    To upload scores from Gradescope to the Score OBE+ system,
                    simply{" "}
                    <span className="font-extrabold">
                      {" "}
                      export the assignment scores{" "}
                    </span>{" "}
                    as a CSV file from Gradescope. <br /> Then, upload the CSV
                    file directly. This quick process ensures seamless
                    integration of your grading data.
                  </p>
                </div>
              </Alert>
              <div
                style={{
                  boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.30)",
                }}
                className="py-14 px-[76px] rounded-md"
              >
                <div className="flex flex-col gap-10">
                  <div className="flex gap-3">
                    <p className=" text-secondary font-semibold text-[22px]">
                      Score OBE<span className=" text-[#FFCD1B]">+</span>{" "}
                      template
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-[16px]">
                    <p className="text-secondary font-semibold ">
                      Use this template to upload score
                    </p>
                    <p className="text-[#6a6a6a] text-[14px] font-[500]">
                      Accurate grades and TQF5 qualifications rely on <br />{" "}
                      using this template to submit your scores.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      leftSection={<IconFile className="size-4" />}
                      variant="outline"
                    >
                      Template guide
                    </Button>
                    <Button
                      leftSection={<IconDownload className="size-4" />}
                      className="size-4"
                    >
                      Download template
                    </Button>
                  </div>
                </div>
              </div>

              <Alert
                radius="md"
                variant="light"
                color="blue"
                classNames={{
                  body: " flex justify-center",
                }}
                title={
                  <div className="flex items-center  gap-2">
                    <IconInfoCircle />
                    <p>Upload Existing Score</p>
                  </div>
                }
              >
                <p className="pl-8 text-default font-medium -mt-1">
                  <span className="font-extrabold">
                    Existing score will be replaced
                  </span>
                  , when you upload file with matching Section, Assignment, and
                  Question
                </p>
              </Alert>

              <Dropzone
                onDrop={(files) => console.log("accepted files", files)}
                onReject={(files) => console.log("rejected files", files)}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                className=" hover:bg-gray-100 py-12 border-[#8f9ae37f] border-dashed bg-gray-50 cursor-pointer border-[2px] rounded-md"
              >
                <Group
                  justify="center"
                  gap="xl"
                  mih={220}
                  style={{ pointerEvents: "none" }}
                >
                  <Dropzone.Accept>
                    <IconUpload
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-blue-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-red-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Reject>

                  <div className=" flex flex-col gap-3 justify-center items-center">
                    <IconUpload
                      color="#5768d5"
                      stroke={1.5}
                      className=" bg-[#DDE0FF] size-16 p-3 rounded-full"
                    />
                    <p className="font-semibold text-default">
                      <span className="text-secondary underline">
                        {" "}
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="-mt-2 font-medium items-center justify-center text-center text-secondary text-b2">
                      CSV or XLSX format only (up to 10MB)
                    </p>
                    <div className="flex flex-col font-medium  text-b2 text-red-500  items-center text-center justify-center">
                      <div className="flex gap-2 items-center justify-center">
                        <IconExclamationCircle color="red" className="size-4" />
                        <p>Supports only Score OBE+</p>
                      </div>
                      <p> Gradescope assignment template</p>
                    </div>
                  </div>
                </Group>
              </Dropzone>
              <div className=" rounded-md items-center border-[2px] border-[#8f9ae37f] py-6 gap-3 px-8 flex">
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <IconFileExcel color="#058A3A" className="size-7" />{" "}
                    <div className="flex flex-col">
                      <p className=" text-secondary font-semibold">
                        File name.xlsx
                      </p>
                      <p className=" text-b3 text-default">88 KB</p>
                    </div>
                  </div>
                  <div className=" ml-9 mt-2 rounded-md h-2 bg-slate-300">
                    {" "}
                    <div className="bg-secondary rounded-md w-72 h-2"></div>
                  </div>
                </div>
              </div>
              <div className=" rounded-md items-center border-[2px] border-[#8f9ae37f] py-6 gap-3 px-8 flex">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <IconFileExcel color="#058A3A" className="size-7" />{" "}
                    <div className="flex flex-col">
                      <p className=" text-secondary font-semibold">
                        File name.xlsx
                      </p>
                      <p className=" text-b3 text-default">88 KB</p>
                    </div>
                  </div>
                  <Button
                    color="#DDE0FF"
                    className=" text-secondary pl-4 font-extrabold hover:text-[#4a58b4] text-b3 rounded-md"
                    leftSection={<IconUpload className="size-4" />}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
