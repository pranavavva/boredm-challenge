export enum Action {
    CUSTOMER_CREATE = "customer:create",
    CUSTOMER_READ = "customer:read",
    CUSTOMER_READ_ALL = "customer:read-all",
    CUSTOMER_UPDATE = "customer:update",
    CUSTOMER_DELETE = "customer:delete",
    CUSTOMER_DELETE_ALL = "customer:delete-all",

    ITEM_CREATE = "item:create",
    ITEM_READ = "item:read",
    ITEM_READ_ALL = "item:read-all",
    ITEM_UPDATE = "item:update",
    ITEM_DELETE = "item:delete",
    ITEM_DELETE_ALL = "item:delete-all",
}

export interface IPayload {
    // action must match one of the Action enum values
    action: Action;
    payload: object[] | string[];
}

export interface IStateResponse {
    customer?: ICustomer[];
    item?: IItem[];
}

export interface IItem {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface ICustomer {
    customer_id: string;
    name: string;
    email: string;
}
