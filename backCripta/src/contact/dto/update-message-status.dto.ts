import { IsIn } from 'class-validator';
import {
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageStatus,
} from '../schemas/contact-message.schema';

export class UpdateMessageStatusDto {
  @IsIn(CONTACT_MESSAGE_STATUSES)
  estado!: ContactMessageStatus;
}
