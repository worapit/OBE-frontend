import { calStat } from "@/helpers/functions/score";
import { IModelAssignment, IModelScore } from "@/models/ModelCourse";
import { IModelUser } from "@/models/ModelUser";
import Curve from "./Curve";
import HistogramChart from "./HistogramChart";
import { IModelStudentAssignment } from "@/models/ModelEnrollCourse";

type Props = {
  data: Partial<IModelAssignment> | IModelStudentAssignment;
  students?: { student: IModelUser; scores: IModelScore[] }[];
  questionName?: string;
  type: "histogram" | "curve";
  studentScore?: number;
};

export default function ChartContainer({
  data,
  students = [],
  questionName,
  type,
  studentScore,
}: Props) {
  const fullScore =
    (questionName
      ? data.questions?.find(({ name }) => name == questionName)?.fullScore
      : data.questions?.reduce((a, { fullScore }) => a + fullScore, 0)) || 0;

  const getScores = (studentScores: IModelScore[]) => {
    const assignment = studentScores.find(
      ({ assignmentName }) => assignmentName === data.name
    );
    if (!assignment) return undefined;
    if (questionName) {
      const score = assignment.questions?.find(
        ({ name }) => name === questionName
      )?.score;
      return !score || score < 0 || typeof score != "number"
        ? undefined
        : score;
    }
    return assignment.questions
      ?.filter(({ score }) => score >= 0)
      .reduce((sum, { score }) => sum + score, 0);
  };

  const scores =
    studentScore != undefined
      ? questionName
        ? (
            data.questions!.find(
              ({ name }) => name == questionName
            ) as Partial<IModelStudentAssignment>
          ).scores
        : (data as IModelStudentAssignment).scores
      : students
          .map(({ scores }) => getScores(scores))
          .filter((score) => score !== undefined)
          .sort((a, b) => a - b);

  const totalStudent = scores?.length || 0;

  const { mean, sd, median, maxScore, minScore, q1, q3 } = calStat(
    scores || [],
    totalStudent
  );
  const k = Math.ceil(Math.log2(totalStudent) + 1);
  const binWidth = (maxScore - minScore) / k;
  const scoresData = Array.from({ length: k }, (_, index) => {
    const start = minScore + index * binWidth;
    const end = start + binWidth;
    return {
      range: `${start.toFixed(2)} - ${end.toFixed(2)}`,
      start: parseFloat(start.toFixed(2) || "0"),
      end: parseFloat(end.toFixed(2) || "0"),
      Students: 0,
    };
  });
  scores?.forEach((score) => {
    const binIndex = scoresData.findIndex((item, index) =>
      index == scoresData.length - 1
        ? item.start <= score && score <= item.end
        : item.start <= score && score < item.end
    );
    if (binIndex !== -1) {
      scoresData[binIndex].Students += 1;
    }
  });

  return (
    <>
      {!questionName && (
        <div className="flex flex-col border-b-2 border-nodata py-2 items-start gap-5 text-start mx-5">
          <div className="flex flex-row text-secondary text-[20px] w-full justify-between font-semibold">
            <div className="flex justify-between !w-full items-center mb-1">
              <div className="flex flex-col">
                <p className="text-[#3f4474]  text-[16px]">{data.name}</p>
                <p>
                  {fullScore?.toFixed(2)}{" "}
                  <span className="text-[16px]">pts.</span>
                </p>
              </div>
              <p className="text-[#3f4474] mb-1 sm:max-macair133:text-[14px] text-[16px]">
                {totalStudent} Students
              </p>
            </div>
          </div>

          <div className="flex  flex-row justify-between w-full">
            {studentScore && (
              <div className="flex flex-col">
                <p className="font-semibold text-[16px] text-secondary">
                  Your Score
                </p>
                <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                  {studentScore.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">Mean</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {mean?.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">SD</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {sd?.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">Median</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {median?.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">Max</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {maxScore?.toFixed(2)}
              </p>
            </div>
            {!studentScore && (
              <div className="flex flex-col">
                <p className="font-semibold text-[16px] text-[#777777]">Min</p>
                <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                  {minScore?.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">Q3</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {q3?.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-[16px] text-[#777777]">Q1</p>
              <p className="font-bold text-[24px] sm:max-macair133:text-[20px] text-default">
                {q1 ? q1?.toFixed(2) : "-"}
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        className={`relative h-full w-full ${
          questionName ? "justify-items-center" : "pl-3 pr-5"
        }`}
      >
        {type == "histogram" ? (
          <HistogramChart scoresData={scoresData} studentScore={studentScore} />
        ) : (
          <Curve
            scores={scores || []}
            mean={mean}
            median={median}
            sd={sd}
            fullScore={fullScore}
            studentScore={studentScore}
          />
        )}
      </div>
    </>
  );
}
