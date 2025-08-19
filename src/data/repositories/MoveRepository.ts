import { Move } from "../../domain/entities/Move";
import { CreateMoveInput, MoveRepository } from "../../domain/use-cases/CreateMove";

export type { MoveRepository, CreateMoveInput };
export interface MoveMapper {
  toDomain(row: any): Move;
}
