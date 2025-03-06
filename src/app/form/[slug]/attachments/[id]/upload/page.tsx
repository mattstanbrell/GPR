

const getReceiptData = () => {
    return {
        "total": 6.83,
        "items": [
            { "name": "CKN BURGERS", "quantity": 1, "cost": 0.97 },
            { "name": "SARDINES", "quantity": 1, "cost": 0.34 },
            { "name": "PORRIDGE OATS", "quantity": 1, "cost": 0.75 },
            { "name": "PEAR PACK", "quantity": 1, "cost": 0.49 },
            { "name": "TIN TOMATOES", "quantity": 1, "cost": 0.35 },
            { "name": "WHOLEMEAL", "quantity": 1, "cost": 0.45 },
            { "name": "S/BERRY JAM", "quantity": 1, "cost": 0.39 },
            { "name": "VEGETABLES", "quantity": 1, "cost": 0.49 },
            { "name": "PASSATA", "quantity": 1, "cost": 0.35 },
            { "name": "KIDNEY BEANS", "quantity": 1, "cost": 0.30 },
            { "name": "JACKET POTATO", "quantity": 1, "cost": 0.49 },
            { "name": "ONION", "quantity": 1, "cost": 0.59 },
            { "name": "MOZZARELLA", "quantity": 1, "cost": 0.47 },
            { "name": "SPAGHETTI", "quantity": 2, "cost": 0.40 }
        ]
    };
}


const Upload = () => {

    const data = getReceiptData()
    const name = "hotel_for_jim.jpg";

    return (
        <>
            <h2>{ name }</h2>
            <form>
                <div>
                    <label>Total £
                        <input type="number" value={ data ? data['total'] : 0.00 } />    
                    </label>
                </div>
                <div className="flex-3">
                    Item Name No. Cost £
                    { data && data['items'] && data['items'].map(({ name, quantity, cost}, index) => (
                        <div key={ index }>
                                <input type="text" value={ name } />
                                <input type="number" value={ quantity } min="0" />
                                <input type="number" value={ cost } min="0.00" />
                        </div>
                    ))}
                </div>
            </form>
        </>
    )
}

export default Upload; 
