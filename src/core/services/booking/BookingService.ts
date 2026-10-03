import { BOOKING_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';
import {
  AvailabilityResponse,
  BayResponse,
  BayStatusCode,
  BookingResponse,
  BookingStatusCode,
  BusinessHourDto,
  CatalogServiceRequest,
  CatalogServiceResponse,
  CreateBookingRequest,
  EstablishmentResponse,
  HoursExceptionRequest,
  HoursExceptionResponse,
  RescheduleBookingRequest,
  ServiceCategoryResponse,
} from './booking.types';

// habla con el booking-service (catálogo, horario, bahías y reservas), mismos endpoints
// que usa la web. El id del cliente nunca viaja: el backend lo saca del token JWT.

const base = { baseUrl: BOOKING_API_URL };

export const bookingService = {
  /* ---------- público ---------- */

  categories(): Promise<ServiceCategoryResponse[]> {
    return request<ServiceCategoryResponse[]>('GET', '/catalog/categories', base);
  },

  // servicios activos; con vehicleTypeId solo viene el precio de ese tipo de vehículo
  services(vehicleTypeId?: number): Promise<CatalogServiceResponse[]> {
    return request<CatalogServiceResponse[]>('GET', '/catalog/services', {
      ...base,
      query: vehicleTypeId ? { vehicleTypeId } : {},
    });
  },

  businessHours(): Promise<BusinessHourDto[]> {
    return request<BusinessHourDto[]>('GET', '/schedule/business-hours', base);
  },

  exceptions(from?: string): Promise<HoursExceptionResponse[]> {
    return request<HoursExceptionResponse[]>('GET', '/schedule/exceptions', {
      ...base,
      query: from ? { from } : {},
    });
  },

  establishment(): Promise<EstablishmentResponse> {
    return request<EstablishmentResponse>('GET', '/establishment', base);
  },

  /* ---------- reservas del cliente ---------- */

  availability(
    date: string,
    vehicleTypeId: number,
    serviceIds: number[],
    excludeBookingId?: number,
  ): Promise<AvailabilityResponse> {
    return request<AvailabilityResponse>('GET', '/bookings/availability', {
      ...base,
      query: {
        date,
        vehicleTypeId,
        serviceIds: serviceIds.join(','),
        excludeBookingId,
      },
    });
  },

  createBooking(body: CreateBookingRequest): Promise<BookingResponse> {
    return request<BookingResponse>('POST', '/bookings', { ...base, body });
  },

  myBookings(): Promise<BookingResponse[]> {
    return request<BookingResponse[]>('GET', '/bookings/me', base);
  },

  cancelMyBooking(id: number): Promise<BookingResponse> {
    return request<BookingResponse>('POST', `/bookings/${id}/cancel`, { ...base, body: {} });
  },

  rescheduleMyBooking(id: number, body: RescheduleBookingRequest): Promise<BookingResponse> {
    return request<BookingResponse>('PUT', `/bookings/${id}`, { ...base, body });
  },

  cancellationReasons(): Promise<{ code: string; name: string }[]> {
    return request<{ code: string; name: string }[]>('GET', '/bookings/cancellation-reasons', base);
  },

  /* ---------- admin: reservas ---------- */

  adminBookings(from: string, to: string, status?: BookingStatusCode): Promise<BookingResponse[]> {
    return request<BookingResponse[]>('GET', '/admin/bookings', {
      ...base,
      query: { from, to, status },
    });
  },

  adminCreateBooking(body: CreateBookingRequest): Promise<BookingResponse> {
    return request<BookingResponse>('POST', '/admin/bookings', { ...base, body });
  },

  adminReschedule(id: number, body: RescheduleBookingRequest): Promise<BookingResponse> {
    return request<BookingResponse>('PUT', `/admin/bookings/${id}`, { ...base, body });
  },

  adminChangeStatus(id: number, status: BookingStatusCode, reasonCode?: string): Promise<BookingResponse> {
    return request<BookingResponse>('PATCH', `/admin/bookings/${id}/status`, {
      ...base,
      body: { status, reasonCode },
    });
  },

  /* ---------- admin: catálogo ---------- */

  adminServices(): Promise<CatalogServiceResponse[]> {
    return request<CatalogServiceResponse[]>('GET', '/admin/catalog/services', base);
  },

  createService(body: CatalogServiceRequest): Promise<CatalogServiceResponse> {
    return request<CatalogServiceResponse>('POST', '/admin/catalog/services', { ...base, body });
  },

  updateService(id: number, body: CatalogServiceRequest): Promise<CatalogServiceResponse> {
    return request<CatalogServiceResponse>('PUT', `/admin/catalog/services/${id}`, { ...base, body });
  },

  setServiceActive(id: number, active: boolean): Promise<CatalogServiceResponse> {
    return request<CatalogServiceResponse>('PATCH', `/admin/catalog/services/${id}/status`, {
      ...base,
      body: { active },
    });
  },

  deleteService(id: number): Promise<void> {
    return request<void>('DELETE', `/admin/catalog/services/${id}`, base);
  },

  /* ---------- admin: horario y bahías ---------- */

  saveBusinessHours(week: BusinessHourDto[]): Promise<BusinessHourDto[]> {
    return request<BusinessHourDto[]>('PUT', '/admin/schedule/business-hours', { ...base, body: week });
  },

  createException(body: HoursExceptionRequest): Promise<HoursExceptionResponse> {
    return request<HoursExceptionResponse>('POST', '/admin/schedule/exceptions', { ...base, body });
  },

  updateException(id: number, body: HoursExceptionRequest): Promise<HoursExceptionResponse> {
    return request<HoursExceptionResponse>('PUT', `/admin/schedule/exceptions/${id}`, { ...base, body });
  },

  deleteException(id: number): Promise<void> {
    return request<void>('DELETE', `/admin/schedule/exceptions/${id}`, base);
  },

  bays(): Promise<BayResponse[]> {
    return request<BayResponse[]>('GET', '/admin/bays', base);
  },

  createBay(name: string, status: BayStatusCode): Promise<BayResponse> {
    return request<BayResponse>('POST', '/admin/bays', { ...base, body: { name, status } });
  },

  updateBay(id: number, name: string, status: BayStatusCode): Promise<BayResponse> {
    return request<BayResponse>('PUT', `/admin/bays/${id}`, { ...base, body: { name, status } });
  },

  deleteBay(id: number): Promise<void> {
    return request<void>('DELETE', `/admin/bays/${id}`, base);
  },
};