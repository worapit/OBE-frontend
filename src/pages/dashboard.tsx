import { useAppSelector } from "@/store";
import { Button } from "@mantine/core";
import { useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
import { statusColor } from "@/helpers/functions/function";
import { TQF_STATUS } from "@/helpers/constants/enum";

export default function Dashboard() {
  const user = useAppSelector((state) => state.user);
  const course = useAppSelector((state) => state.course);

  return (
    <div className=" bg-[#F6F6F6] flex flex-col  h-full w-full p-6 py-5 gap-3">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[#6869AD] text-[22px] font-medium mb-[2px]">
            Hi there, {user.firstNameEN} {user.lastNameEN?.slice(0, 1)}.{" "}
          </p>
          <p className="text-[#575757] text-[14px]">
            In semester 1, 2567! You currently have{" "}
            <span className="text-[#5768D5] font-semibold">20 courses </span> on
            your plate. Let dive in!
          </p>
        </div>
        <Button className=" rounded-[8px] text-[12px] font-medium bg-[#6869AD] h-8 px-2 hover:bg-[#52538A]">
          <IconPlus className="h-5 w-5 mr-1" stroke={1.5} color="#ffffff" />
          Add course
        </Button>
      </div>
      <div
        className="flex flex-wrap w-full h-full bg-white rounded-[5px] p-5"
        style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.50)" }}
      >
        {course.map((item) => {
          const statusTQF3 = statusColor(item.TQF3?.status);
          const statusTQF5 = statusColor(item.TQF5?.status);
          return (
            <div
              key={item.id}
              className="card justify-between rounded-md"
              style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.50)" }}
            >
              <div className="p-2.5">
                <p className="font-semibold">{item.courseNo}</p>
                <p className="text-xs font-medium">{item.courseName}</p>
              </div>
              <div className="bg-primary flex justify-between rounded-b-md">
                <p className="p-2.5 text-white">
                  {item.sections.length} Section
                  {item.sections.length > 1 ? "s" : ""}
                </p>
                <div className="flex gap-3 px-2.5 py-1 justify-end items-center">
                  <p className={`px-1 border-2 rounded-md ${statusTQF3}`}>
                    TQF 3
                  </p>
                  <p className={`px-1 border-2 rounded-md ${statusTQF5}`}>
                    TQF 5
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
