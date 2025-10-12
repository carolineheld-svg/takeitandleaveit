# TakeItAndLeaveIt

A campus marketplace with a pink and gold aesthetic. Trade items for free or sell them for cash with fellow Cate students and faculty - sustainable, convenient, and community-focused!

## Features

- **Design** - Pink and gold theme with elegant typography
- **Flexible Listing** - Choose to give items away for free or sell them for up to $200
- **Item Listing** - Upload up to 4 images with detailed item information (brand, condition, size, description)
- **Payment Methods** - Accept Venmo, Zelle, Apple Pay, or Cash for items you sell
- **Browse & Discover** - Find free items and great deals with advanced search and filtering
- **Unified Messaging** - Chat with sellers directly, ask questions, and negotiate
- **Trade System** - Send formal purchase offers or trade requests that sellers can accept/decline
- **User Profiles** - Manage your profile with payment preferences (Venmo, Zelle usernames)
- **Authentication** - Secure user registration and login with Supabase Auth
- **Responsive Design** - Fully optimized for mobile and desktop
- **Image Upload** - Secure image storage with Supabase Storage
- **Item Management** - Mark items as traded and track trade history
- **Smart Recommendations** - AI-powered suggestions based on your preferences
- **Carbon Tracking** - Track your environmental impact from sustainable trading

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom pink and gold theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd takeitandleaveit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles with payment preferences (Venmo, Zelle)
- **items** - Listed items with pricing, payment methods, and listing type (free/for sale)
- **trade_requests** - Formal purchase offers and trade requests with accept/decline
- **direct_messages** - Unified messaging system for all user conversations
- **wishlist** - Saved items
- **notifications** - Real-time user notifications
- **user_preferences** - SmartMatch AI recommendations data
- **carbon tracking** - Environmental impact metrics

### Required Supabase Storage Bucket

Create a storage bucket named `item-images` in your Supabase project with the following policies:
- Public read access for viewing images
- Authenticated users can upload images
- Users can only delete their own images

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

The application will be available at your Vercel domain.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages (login, signup)
│   ├── browse/            # Browse items page
│   ├── list/              # List item page
│   ├── profile/           # User profile page
│   ├── trades/            # Trade requests page
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat system components
│   ├── navigation/        # Navigation components
│   └── trade/             # Trade-related components
└── lib/                   # Utility libraries
    ├── database.ts        # Database operations
    ├── supabase.ts        # Supabase client configuration
    └── supabase-storage.ts # Image upload utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with love and sustainable trading in mind.