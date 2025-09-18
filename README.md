# TakeItAndLeaveIt

A campus trading platform with a pink and gold aesthetic. Trade items with fellow Cate students and faculty - sustainable, convenient, and completely free!

## Features

- **Design** - Pink and gold theme with elegant typography
- **Item Listing** - Upload up to 4 images with detailed item information (brand, condition, size, description)
- **Browse & Discover** - Find items from the community with search and filtering
- **Trade System** - Send, accept, or decline trade requests with custom messages
- **Chat System** - Coordinate trades with real-time messaging after acceptance
- **User Profiles** - Create and manage your profile with listed items
- **Authentication** - Secure user registration and login with Supabase Auth
- **Responsive Design** - Works well on all devices
- **Image Upload** - Secure image storage with Supabase Storage
- **Item Management** - Mark items as traded and track trade history

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

- **profiles** - User profiles (extends auth.users)
- **items** - Listed clothing items with images, condition, size, etc.
- **trade_requests** - Trade requests between users with status tracking
- **chat_messages** - Messages for coordinating trades after acceptance

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