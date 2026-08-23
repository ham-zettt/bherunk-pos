export interface PosProduct {
	id: string;
	name: string;
	price: string;
	stock: number;
	categoryId: string;
	categoryName: string;
}

export interface PosCategory {
	id: string;
	name: string;
}
