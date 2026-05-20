import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import Modal from './Modal';

interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  id,
  description,
  amount,
  type,
  category,
  date,
  onDelete,
  onEdit
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isExpense = type === 'expense';
  const amountClass = isExpense ? 'text-red-600' : 'text-green-600';
  const sign = isExpense ? '-' : '+';
  
  const categoryIcons: Record<string, string> = {
    alimentacion: '🍎',
    transporte: '🚗',
    ocio: '🎬',
    salario: '💰',
    suscripciones: '📺',
    salud: '🏥',
    educacion: '📚',
    extra: '✨',
    inversion: '📈',
    regalo: '🎁',
    servicios: '💡',
    otros: '📦'
  };
  
  const categoryIcon = categoryIcons[category] || '📌';
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteModal(false);
  };
  
  return (
    <>
      <div className="flex justify-between items-center p-4 border-b hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">{categoryIcon}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{description}</p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{categoryIcon} {category}</span>
              <span>•</span>
              <span>📅 {formatDate(date)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`font-bold text-lg ${amountClass}`}>
            {sign} {formatCurrency(amount)}
          </span>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
        onConfirm={handleDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar la transacción <strong>"{description}"</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
      </Modal>
    </>
  );
};

export default TransactionCard;