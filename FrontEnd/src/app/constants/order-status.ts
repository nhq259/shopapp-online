export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REFUND = 'REFUND',
  FAILED = 'FAILED',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELED]: 'Canceled',
  [OrderStatus.REFUND]: 'Refund',
  [OrderStatus.FAILED]: 'Failed',
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'status-pending',
  [OrderStatus.PROCESSING]: 'status-processing',
  [OrderStatus.SHIPPED]: 'status-shipped',
  [OrderStatus.DELIVERED]: 'status-delivered',
  [OrderStatus.CANCELED]: 'status-canceled',
  [OrderStatus.REFUND]: 'status-refund',
  [OrderStatus.FAILED]: 'status-failed',
};
