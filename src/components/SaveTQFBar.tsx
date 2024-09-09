import { useAppDispatch, useAppSelector } from "@/store";
import { Button } from "@mantine/core";
import saveIcon from "@/assets/icons/save.svg?react";
import Icon from "./Icon";
import { COURSE_TYPE, ROLE } from "@/helpers/constants/enum";
import { IModelTQF3 } from "@/models/ModelTQF3";
import { IModelTQF5 } from "@/models/ModelTQF5";
import { dateFormatter } from "@/helpers/functions/function";

export const partLabel = {
  part1: "Part 1",
  part2: "Part 2",
  part3: "Part 3",
  part4: "Part 4",
  part5: "Part 5",
  part6: "Part 6",
};

export type partType =
  | "part1"
  | "part2"
  | "part3"
  | "part4"
  | "part5"
  | "part6";

type Props = {
  tqf: string;
  part: partType;
  data: IModelTQF3 | IModelTQF5;
  onSave: () => void;
  canSave: boolean;
};

export default function SaveTQFbar({
  tqf,
  part,
  data,
  onSave,
  canSave,
}: Props) {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  return (
    <>
      <div
        className={`min-h-14 justify-end gap-4 overflow-y-auto bottom-0 w-full bg-white border-[#e0e0e0] px-6 inline-flex flex-wrap items-center z-50 text-secondary`}
        style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {data && Object.keys(data).includes(part) && (
          <p className="text-[11px] flex flex-col text-end text-secondary font-medium">
            <span className="font-bold"></span>{" "}
            <span>{dateFormatter(data[part]?.updatedAt)}</span>
          </p>
        )}
        <Button
          className="text-[12px] font-semibold h-8 w-[128px] rounded-md disabled:bg-disable"
          onClick={onSave}
          disabled={!canSave}
        >
          <div className="flex gap-2 items-center">
            <Icon IconComponent={saveIcon} />
            Save {part}
          </div>
        </Button>
      </div>
    </>
  );
}
