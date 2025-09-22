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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-coquette opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
                   <h1 className="text-5xl md:text-7xl font-coquette font-bold text-coquette-pink-700 mb-6">
                     Take It And
                     <span className="block bg-gradient-to-r from-coquette-pink-500 to-coquette-gold-500 bg-clip-text text-transparent">
                       Leave It
                     </span>
                   </h1>
                   {/* Cache bust: Updated authentication buttons */}
            <p className="text-xl text-coquette-pink-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Take it or leave it has come to the web! Connect with fellow Cate students, trade items locally, and reduce waste all on campus. 
              Sustainable, convenient, and 100% free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                // User is signed in - show trading buttons
                <>
                  <Link href="/browse" className="btn-primary text-lg px-8 py-3">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Browse Items
                  </Link>
                  <Link href="/list" className="btn-outline text-lg px-8 py-3">
                    List Your Item
                  </Link>
                </>
              ) : (
                // User is not signed in - show auth buttons
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </Link>
                  <Link href="/auth/login" className="btn-outline text-lg px-8 py-3">
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
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-coquette font-bold text-coquette-pink-700 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-coquette-pink-600 max-w-2xl mx-auto">
              Sustainable, convenient, and community-focused campus trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-coquette-pink-400 to-coquette-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-coquette font-semibold text-coquette-pink-700 mb-4">
                List Your Items
              </h3>
              <p className="text-coquette-pink-600 leading-relaxed">
                Upload up to 4 photos, add details about brand, condition, and size. 
                Give your items a second life with fellow Cate community members.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-coquette-gold-400 to-coquette-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-coquette font-semibold text-coquette-pink-700 mb-4">
                Browse & Discover
              </h3>
              <p className="text-coquette-pink-600 leading-relaxed">
                Explore items from fellow Cate students and faculty right on campus. 
                Find pre-loved pieces that fit your style and budget.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-coquette font-semibold text-coquette-pink-700 mb-4">
                Trade & Connect
              </h3>
              <p className="text-coquette-pink-600 leading-relaxed">
                Send trade requests, meet up on campus, and coordinate exchanges. 
                Build sustainable habits while connecting with the Cate community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-pink">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-coquette font-bold text-coquette-pink-700 mb-6">
            Ready to Start Your
            <span className="block text-coquette-gold-600">Sustainable Journey?</span>
          </h2>
          <p className="text-xl text-coquette-pink-600 mb-8">
            Join the Cate community and start reducing waste while discovering amazing pre-loved items.
          </p>
          {user ? (
            <Link href="/browse" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Items
            </Link>
          ) : (
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Join Now
            </Link>
          )}
        </div>
      </section>

             {/* Recommendations Section */}
             <RecommendationsSection />

             {/* Carbon Impact Section */}
             <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                   <h2 className="text-4xl font-coquette font-bold text-green-700 mb-6">
                     Environmental Impact
                   </h2>
                   <p className="text-xl text-green-600 max-w-2xl mx-auto">
                     Track your carbon footprint savings and see how trading makes a difference
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