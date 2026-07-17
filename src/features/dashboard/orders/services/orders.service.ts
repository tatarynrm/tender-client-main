import api from "@/shared/api/instance.api";

class OrdersService {
  async getOrdersStatistic(mid: string | number): Promise<any> {
    try {
      const response = await api.get<any>(
        `/oracle/client-orders-statistic/${mid}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch orders statistic", error);
      return null;
    }
  }

  async getOrdersList(
    mid: string | number,
    transit: string,
    page: number = 1,
    perPage: number = 1000
  ): Promise<any> {
    try {
      const response = await api.post<any>(
        `/oracle/client-orders-list/${mid}`,
        { transit, pagination: { page, per_page: perPage } }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch orders list", error);
      return [];
    }
  }
}

export const ordersService = new OrdersService();
