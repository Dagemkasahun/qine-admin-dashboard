// src/pages/merchant/CompanyProfile.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Mail, Globe, Clock, 
  Calendar, Users, Award, Shield, Target, Heart,
  Facebook, Instagram, Twitter, Linkedin, ExternalLink
} from 'lucide-react';

const CompanyProfile = () => {
  const { businessModel } = useOutletContext();

  const socialLinks = {
    facebook: businessModel.socialMedia?.facebook,
    instagram: businessModel.socialMedia?.instagram,
    twitter: businessModel.socialMedia?.twitter,
    linkedin: businessModel.socialMedia?.linkedin
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">About {businessModel.name}</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          {businessModel.description || 'No description provided yet.'}
        </p>
        
        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="text-center">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase">Founded</p>
            <p className="font-semibold text-slate-800">{businessModel.foundedYear || 'N/A'}</p>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase">Employees</p>
            <p className="font-semibold text-slate-800">{businessModel.employees || 'N/A'}</p>
          </div>
          <div className="text-center">
            <Award className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase">Rating</p>
            <p className="font-semibold text-yellow-500">★ 4.8/5</p>
          </div>
          <div className="text-center">
            <Target className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase">Since</p>
            <p className="font-semibold text-slate-800">{businessModel.joinedDate?.split('-')[0] || '2024'}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address & Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{businessModel.location || 'Address not specified'}</p>
                <p className="text-xs text-slate-400 mt-1">Addis Ababa, Ethiopia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600">{businessModel.phone || 'Phone not specified'}</p>
                <p className="text-xs text-slate-400">Manager: {businessModel.managerPhone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600">{businessModel.email || 'Email not specified'}</p>
                <p className="text-xs text-slate-400">Manager: {businessModel.managerEmail || 'N/A'}</p>
              </div>
            </div>
            {businessModel.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <a 
                  href={businessModel.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {businessModel.website} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Business Hours
          </h3>
          <div className="space-y-2">
            {days.map((day, index) => {
              const hours = businessModel.businessHours?.[day];
              return (
                <div key={day} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700 capitalize">{dayNames[index]}</span>
                  {hours?.closed ? (
                    <span className="text-slate-400 text-sm">Closed</span>
                  ) : (
                    <span className="text-slate-600 text-sm">
                      {hours?.open || '09:00'} - {hours?.close || '18:00'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Management Team */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Management Team
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {businessModel.managerName?.charAt(0) || 'M'}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{businessModel.managerName || 'Not specified'}</p>
              <p className="text-xs text-slate-500">General Manager</p>
              <p className="text-xs text-slate-400 mt-1">{businessModel.managerPhone || 'No phone'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {businessModel.managerEmail?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-semibold text-slate-800">Customer Support</p>
              <p className="text-xs text-slate-500">24/7 Support Team</p>
              <p className="text-xs text-slate-400 mt-1">{businessModel.phone || 'Contact via phone'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      {Object.values(socialLinks).some(link => link) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-600" />
            Connect With Us
          </h3>
          <div className="flex gap-4">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center hover:scale-110 transition">
                <Facebook className="w-5 h-5 text-white" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-tr from-yellow-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1da1f2] rounded-full flex items-center justify-center hover:scale-110 transition">
                <Twitter className="w-5 h-5 text-white" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#0a66c2] rounded-full flex items-center justify-center hover:scale-110 transition">
                <Linkedin className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;