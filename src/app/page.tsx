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
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-elegant font-bold text-secondary-900 mb-6">
              Take It And
              <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Leave It
              </span>
            </h1>
            <p className="text-xl text-secondary-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Take it or leave it has come to the web! Connect with fellow Cate students, trade items locally, and reduce waste all on campus.
              Sustainable, convenient, and 100% free!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                // User is signed in - show trading buttons
                <>
                  <Link href="/browse" className="btn-primary text-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Browse Items
                  </Link>
                  <Link href="/list" className="btn-outline text-lg flex items-center justify-center">
                    List Your Item
                  </Link>
                </>
              ) : (
                // User is not signed in - show auth buttons
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </Link>
                  <Link href="/auth/login" className="btn-outline text-lg flex items-center justify-center">
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
          <div className="text-center mb-20">
            <h2 className="text-4xl font-elegant font-bold text-secondary-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg text-secondary-700 max-w-2xl mx-auto font-medium">
              Sustainable, convenient, and community-focused campus trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-secondary-900 mb-6">
                List Your Items
              </h3>
              <p className="text-secondary-700 leading-relaxed font-medium">
                Upload up to 4 photos, add details about brand, condition, and size.
                Give your items a second life with fellow Cate community members.
              </p>
            </div>
            
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-secondary-900 mb-6">
                Browse & Discover
              </h3>
              <p className="text-secondary-700 leading-relaxed font-medium">
                Explore items from fellow Cate students and faculty right on campus.
                Find pre-loved pieces that fit your style and budget.
              </p>
            </div>
            
            <div className="text-center card-elevated p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-elegant font-bold text-secondary-900 mb-6">
                Trade & Connect
              </h3>
              <p className="text-secondary-700 leading-relaxed font-medium">
                Send trade requests, meet up on campus, and coordinate exchanges.
                Build sustainable habits while connecting with the Cate community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-accent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-elegant font-bold text-secondary-900 mb-6">
            Ready to Start Your
            <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Sustainable Journey?</span>
          </h2>
          <p className="text-xl text-secondary-700 mb-12 font-medium">
            Join the Cate community and start reducing waste while discovering amazing pre-loved items.
          </p>
          {user ? (
            <Link href="/browse" className="btn-primary text-lg inline-flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Items
            </Link>
          ) : (
            <Link href="/auth/signup" className="btn-primary text-lg inline-flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Join Now
            </Link>
          )}
        </div>
      </section>

             {/* Recommendations Section */}
             <RecommendationsSection />

             {/* Carbon Impact Section */}
             <section className="py-20 bg-gradient-to-br from-success-50 to-success-100">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                   <h2 className="text-4xl font-elegant font-bold text-secondary-900 mb-6">
                     Environmental Impact
                   </h2>
                   <p className="text-xl text-secondary-700 max-w-2xl mx-auto font-medium">
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