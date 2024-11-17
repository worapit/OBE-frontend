import { isValidResponse } from "@/helpers/functions/validation";
import { scoreController } from "./score.repository";

const scoreService = scoreController();

export const uploadScore = async (params: any) => {
  const res = await scoreService.uploadScore(params);
  return isValidResponse(res);
};
export const publishScore = async (params: any) => {
  const res = await scoreService.publishScore(params);
  return isValidResponse(res);
};
