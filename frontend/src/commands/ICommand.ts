/**
 * PATRÓN COMMAND
 * 
 * Interfaz que define el contrato para todos los comandos.
 * Cada comando encapsula una solicitud como un objeto.
 */

export interface ICommand<T = any> {
  execute(): Promise<T>;
  getDescription(): string;
}

export interface ICommandWithUndo<T = any> extends ICommand<T> {
  undo(): Promise<void>;
}