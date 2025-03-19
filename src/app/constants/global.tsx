
import type { SelectNameID } from "../types/input";

export const MAX_FILE_SIZE_IN_MB = 20;
export const VALID_IMAGE_TYPES = [
    "image/jpeg", "image/png", "image/webp", "image/heic","image/heif",
  ]

export const MESSAGE_STATUS = {
  APPROVED: 1,
  REJECTED: 2,
  SUBMITTED: 3,
  AWAITING_APPROVAL: 4,
}

export const gendersNameID: SelectNameID[] = [
  { name: "Male", id: "Male" },
  { name: "Female", id: "Female" }
]