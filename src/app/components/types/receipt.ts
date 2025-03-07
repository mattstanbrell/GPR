
interface ReceiptItem {
    name: string,
    quantity: number, 
    cost: number, 
}

interface ReceiptData {
    total: number,
    items: ReceiptItem[]
}