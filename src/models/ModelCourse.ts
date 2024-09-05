import { COURSE_TYPE } from "@/helpers/constants/enum";
import { IModelAcademicYear } from "./ModelAcademicYear";
import { IModelSection } from "./ModelSection";
import { IModelTQF3 } from "./ModelTQF3";
import { IModelTQF5 } from "./ModelTQF5";

export interface IModelCourse {
  id: string;
  academicYear: IModelAcademicYear | string;
  courseNo: string;
  courseName: string;
  type: string;
  sections: Partial<IModelSection>[];
  addFirstTime?: boolean;
  TQF3?: IModelTQF3;
  TQF5?: IModelTQF5;
}
