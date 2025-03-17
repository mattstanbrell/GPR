
interface ReceiptItem {
    name: string,
    quantity: number, 
    cost: number, 
}

export interface ReceiptData {
    total: number,
    items: ReceiptItem[]
}