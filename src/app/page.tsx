'use client'

import Link from "next/link";
import { Heart, Sparkles, Users, ShoppingBag, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import RecommendationsSection from "@/components/recommendations/RecommendationsSection";
import CarbonImpactCard from "@/components/carbon/CarbonImpactCard";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-periwinkle">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 to-lavender-50/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-elegant font-bold text-primary-900 mb-4 sm:mb-6 px-4">
              Take It And
              <span className="block bg-gradient-to-r from-rose-500 to-lavender-500 bg-clip-text text-transparent">
                Leave It
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-700 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-4">
              Trade items for free or sell them for cash! Connect with fellow Cate students and faculty, discover amazing deals, and reduce waste---all on campus.
              Your sustainable marketplace!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              {user ? (
                // User is signed in - show trading buttons
                <>
                 <Link href="/browse" className="btn-primary text-lg flex items-center justify-center min-h-[48px] touch-manipulation">
                   Browse Items
                 </Link>
                  <Link href="/list" className="btn-outline text-lg flex items-center justify-center min-h-[48px] touch-manipulation">
                    List Your Item
                  </Link>
                </>
              ) : (
                // User is not signed in - show auth buttons
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg flex items-center justify-center min-h-[48px] touch-manipulation">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </Link>
                  <Link href="/auth/login" className="btn-outline text-lg flex items-center justify-center min-h-[48px] touch-manipulation">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-elegant font-bold text-primary-900 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg text-primary-700 max-w-2xl mx-auto font-medium px-4">
              Trade items for free or sell them for cash - all within the Cate community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-soft">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-primary-900 mb-6">
                List Your Items
              </h3>
              <p className="text-primary-700 leading-relaxed font-medium">
                Upload up to 4 photos, add details, and choose: give items away for free or sell them for up to $200.
                Your choice, your community!
              </p>
            </div>
            
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-soft">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-primary-900 mb-6">
                Browse & Discover
              </h3>
              <p className="text-primary-700 leading-relaxed font-medium">
                Find free items and great deals from Cate students and faculty.
                Filter by price, category, brand, and more to discover exactly what you need.
              </p>
            </div>
            
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-mint-400 to-mint-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-soft">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-primary-900 mb-6">
                Message, Trade & Buy
              </h3>
              <p className="text-primary-700 leading-relaxed font-medium">
                Chat with sellers, make offers, or get items for free. Coordinate meetups on campus and arrange payment through Venmo, Zelle, or cash.
                Sustainable and community-focused!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-accent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-elegant font-bold text-primary-900 mb-6">
            Ready to Start Your
            <span className="block bg-gradient-to-r from-rose-500 to-lavender-500 bg-clip-text text-transparent">Journey?</span>
          </h2>
          <p className="text-xl text-primary-700 mb-12 font-medium">
            Join the Cate community to trade, buy, and sell items while reducing waste and saving money.
          </p>
          {user ? (
            <Link href="/browse" className="btn-primary text-lg inline-flex items-center min-h-[48px] touch-manipulation">
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Items
            </Link>
          ) : (
            <Link href="/auth/signup" className="btn-primary text-lg inline-flex items-center min-h-[48px] touch-manipulation">
              <UserPlus className="w-5 h-5 mr-2" />
              Join Now
            </Link>
          )}
        </div>
      </section>

             {/* Recommendations Section */}
             <RecommendationsSection />

             {/* Carbon Impact Section */}
             <section className="py-20 bg-gradient-mint">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                   <h2 className="text-4xl font-elegant font-bold text-primary-900 mb-6">
                     Environmental Impact
                   </h2>
                   <p className="text-xl text-primary-700 max-w-2xl mx-auto font-medium">
                     Track your carbon footprint savings from trading and buying secondhand
                   </p>
                 </div>

                 <div className="max-w-4xl mx-auto">
                   <CarbonImpactCard 
                     userId={user?.id} 
                     showPersonal={!!user} 
                     showCampus={true} 
                   />
                 </div>
               </div>
             </section>

    </div>
  );
}