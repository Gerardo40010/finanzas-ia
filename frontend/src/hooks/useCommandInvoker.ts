import { useState } from 'react';
import { ICommand } from '../commands/ICommand';
import { toast } from 'react-hot-toast';

/**
 * PATRÓN COMMAND - Invocador
 * 
 * Este hook actúa como el Invocador que ejecuta comandos
 * y maneja estados de carga, éxito y error.
 */
interface CommandState {
  isExecuting: boolean;
  error: string | null;
  lastResult: any;
}

export function useCommandInvoker() {
  const [state, setState] = useState<CommandState>({
    isExecuting: false,
    error: null,
    lastResult: null,
  });

  const execute = async <T>(command: ICommand<T>, options?: { showSuccessToast?: boolean; successMessage?: string }): Promise<T | null> => {
    setState({ isExecuting: true, error: null, lastResult: null });
    
    try {
      const result = await command.execute();
      setState({ isExecuting: false, error: null, lastResult: result });
      
      if (options?.showSuccessToast) {
        toast.success(options.successMessage || 'Comando ejecutado correctamente');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al ejecutar comando';
      setState({ isExecuting: false, error: errorMessage, lastResult: null });
      toast.error(errorMessage);
      return null;
    }
  };

  const reset = () => {
    setState({ isExecuting: false, error: null, lastResult: null });
  };

  return {
    execute,
    reset,
    isExecuting: state.isExecuting,
    error: state.error,
    lastResult: state.lastResult,
  };
}