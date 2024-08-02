import { useState } from "react";
import { Button, CloseButton, Input, Tooltip } from "@mantine/core";
import Profile from "./Profile";
import { TbSearch } from "react-icons/tb";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_PATH } from "@/helpers/constants/route";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCourseList } from "@/store/course";
import { CourseRequestDTO } from "@/services/course/dto/course.dto";
import { getCourse } from "@/services/course/course.service";
import { ellipsisText } from "@/helpers/functions/validation";

export default function Navbar() {
  const location = useLocation().pathname;
  const [params, setParams] = useSearchParams();
  const academicYear = useAppSelector((state) => state.academicYear);
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const payloadCourse = new CourseRequestDTO();
  const [isFocused, setIsFocused] = useState(false);

  const searchCourse = async (reset?: boolean) => {
    setIsFocused(false);
    if (reset) payloadCourse.search = "";
    else payloadCourse.search = searchValue;
    payloadCourse.academicYear =
      academicYear.find(
        (e) =>
          e.year == parseInt(params.get("year") ?? "") &&
          e.semester == parseInt(params.get("semester") ?? "")
      )?.id ?? "";
    const res = await getCourse(payloadCourse);
    if (res) {
      dispatch(setCourseList(res.courses ?? res));
    }
    localStorage.setItem("search", "true");
  };

  const reset = () => {
    setSearchValue("");
    searchCourse(true);
  };

  return (
    <div
      style={{ boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.20)" }}
      className="min-h-14 drop-shadow-md px-6 rounded-tl-3xl inline-flex flex-wrap justify-between items-center z-50 bg-white  text-primary text-[18px]"
    >
      <p className="font-medium">Your Courses</p>
      {[ROUTE_PATH.DASHBOARD_INS].includes(location) && (
        <div className="w-[400px]">
          <Input
            leftSection={!isFocused && <TbSearch />}
            placeholder="Course No / Course Name"
            size="xs"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            onKeyDown={(event) => event.key == "Enter" && searchCourse()}
            onInput={() => setIsFocused(true)}
            classNames={{
              input:
                "bg-gray-100 rounded-md focus:border-1  focus:border-secondary",
            }}
            rightSectionPointerEvents="all"
            rightSection={
              searchValue.length > 0 && (
                <Tooltip className="text-[12px]" label="Reset">
                  <CloseButton size="sm" onClick={reset} />
                </Tooltip>
              )
            }
          />
          {isFocused && (
            <div
              className="mt-2 absolute cursor-pointer w-[400px] bg-gray-100 rounded-md text-slate-800 px-2 py-3 text-[12px] flex justify-between items-center"
              onClick={() => searchCourse()}
            >
              <div className="flex items-center gap-3">
                <TbSearch className="w-auto" />
                {searchValue.length > 0 ? (
                  <p className="">{ellipsisText(searchValue, 35)}</p>
                ) : (
                  <p>Show All Your Course</p>
                )}
              </div>

              <p>
                Press{" "}
                <span className="ml-1 border-[1px] border-gray-600 p-1 font-semibold rounded-md">
                  Enter
                </span>
              </p>
            </div>
          )}
        </div>
      )}
      <Profile />
    </div>
  );
}
