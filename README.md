# Odai's Apartment Booking Website

## Project Goal

Build a personal website to list and rent my short-term rental apartments. The goal is to avoid commissions from Airbnb and Booking.com by allowing guests to book directly through my own website.

I currently manage 2 apartments and may add 2 more in the future.

## Website Pages

The website will include the following pages:

- **Homepage**
- **Apartments List**
- **Apartment Details Page**
- **Booking Page**
- **Booking Confirmation Page**
- **Contact Page**
- **Admin Dashboard (Private)**

## Core Features

### 🧭 Pages

1. **Homepage**
   - Welcome section
   - Short intro about the apartments
   - Featured property preview cards

2. **Apartments List**
   - Grid of all available apartments
   - Each card includes: name, image, price per night, location, “View Details” button

3. **Apartment Details Page**
   - Photo gallery
   - Description
   - Amenities list
   - Availability calendar
   - "Book Now" button

4. **Booking Page**
   - Date picker (check-in & check-out)
   - Guest count
   - Contact form: name, phone, email
   - Submit booking

5. **Booking Confirmation Page**
   - Thank you message
   - Summary of booking

6. **Contact Page**
   - Basic contact form or contact details

7. **Admin Dashboard (Private)**
   - Simple login (or just password-protected)
   - View list of all bookings
   - Mark bookings as confirmed or pending

## Functionality

- View available apartments
- View apartment details
- Choose check-in/check-out dates
- Submit booking form
- Store booking in a Supabase database
- Notify admin (me) when a booking is submitted
- View bookings in admin area

## Design Preferences

- Clean, minimalist design
- Mobile-friendly (responsive)
- Similar feeling to Airbnb (but simpler)
- Use soft colors like white, beige, gray, and maybe green or gold highlights

## Booking Flow (User Journey)

1. User opens homepage
2. Browses available apartments
3. Clicks to view one apartment
4. Selects check-in & check-out dates
5. Fills booking form
6. Sees confirmation message
7. Admin receives booking and follows up manually

## Notes

- I will be adding apartment photos and text content myself
- The booking can be confirmed manually — no need for automatic payment right now
- All data (apartments, bookings) should be saved using **Supabase**
- Please use file and folder structure best suited for a modern web app
