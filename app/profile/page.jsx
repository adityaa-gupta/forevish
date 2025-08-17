"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
} from "lucide-react";
import { updateUser } from "../_store/features/userSlice";
import { updateUserProfile, uploadProfileImage } from "../lib/services/users";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { userInfo, isLoggedIn, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  console.log("userInfo in ProfilePage", userInfo);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    preferences: {
      newsletter: true,
      notifications: true,
      smsUpdates: false,
    },
  });
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/auth");
    }
  }, [isLoggedIn, loading, router]);

  // Load user data when component mounts
  useEffect(() => {
    if (userInfo) {
      setProfileData((prev) => ({
        ...prev,
        displayName: userInfo.displayName || userInfo.fullName || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        dateOfBirth: userInfo.dateOfBirth || "",
        gender: userInfo.gender || "",
        address: {
          street: userInfo.address?.street || "",
          city: userInfo.address?.city || "",
          state: userInfo.address?.state || "",
          zipCode: userInfo.address?.zipCode || "",
          country: userInfo.address?.country || "",
        },
        preferences: {
          newsletter:
            userInfo.preferences?.newsletter !== undefined
              ? userInfo.preferences.newsletter
              : true,
          notifications:
            userInfo.preferences?.notifications !== undefined
              ? userInfo.preferences.notifications
              : true,
          smsUpdates:
            userInfo.preferences?.smsUpdates !== undefined
              ? userInfo.preferences.smsUpdates
              : false,
        },
      }));
      setPreviewPhoto(userInfo.photoURL || null);
    }
  }, [userInfo]);

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn || !userInfo) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setProfileData((p) => ({
        ...p,
        address: { ...p.address, [key]: value },
      }));
      return;
    }
    if (name.startsWith("preferences.")) {
      const key = name.split(".")[1];
      setProfileData((p) => ({
        ...p,
        preferences: {
          ...p.preferences,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
      return;
    }
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Not an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");

    // Optimistic preview
    const localUrl = URL.createObjectURL(file);
    setPreviewPhoto(localUrl);
    setIsUploading(true);
    try {
      const result = await uploadProfileImage(
        userInfo.uid || userInfo.id,
        file
      );
      if (!result.success) {
        setPreviewPhoto(userInfo.photoURL || null);
        return toast.error(result.error || "Upload failed");
      }
      dispatch(
        updateUser({
          ...userInfo,
          photoURL: result.photoURL,
        })
      );
      toast.success("Photo updated");
    } catch (err) {
      console.error(err);
      setPreviewPhoto(userInfo.photoURL || null);
      toast.error("Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        displayName: profileData.displayName.trim(),
        phone: profileData.phone.trim(),
        dateOfBirth: profileData.dateOfBirth || "",
        gender: profileData.gender || "",
        address: { ...profileData.address },
        preferences: { ...profileData.preferences },
      };
      const res = await updateUserProfile(userInfo.uid || userInfo.id, payload);
      if (!res.success) throw new Error(res.error || "Update failed");
      dispatch(
        updateUser({
          ...userInfo,
          ...payload,
        })
      );
      console.log({ ...userInfo, ...payload });
      setIsEditing(false);
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      setProfileData((prev) => prev); // will be reset by effect if userInfo changed
      // Re-run normalization explicitly:
      setProfileData({
        displayName: userInfo.displayName || userInfo.fullName || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        dateOfBirth: userInfo.dateOfBirth || "",
        gender: userInfo.gender || "",
        address: {
          street: userInfo.address?.street || "",
          city: userInfo.address?.city || "",
          state: userInfo.address?.state || "",
          zipCode: userInfo.address?.zipCode || "",
          country: userInfo.address?.country || "",
        },
        preferences: {
          newsletter:
            userInfo.preferences?.newsletter !== undefined
              ? userInfo.preferences.newsletter
              : true,
          notifications:
            userInfo.preferences?.notifications !== undefined
              ? userInfo.preferences.notifications
              : true,
          smsUpdates:
            userInfo.preferences?.smsUpdates !== undefined
              ? userInfo.preferences.smsUpdates
              : false,
        },
      });
      setPreviewPhoto(userInfo.photoURL || null);
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow">
                    {previewPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewPhoto}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-white border-b-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow transition">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.displayName || "Your Profile"}
                  </h1>
                  <p className="text-gray-600">{profileData.email}</p>
                  <div className="flex items-center mt-2">
                    <Shield className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      Verified Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
            </div>
            <div className="px-6 py-6 space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled={true} // Email should not be editable
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Address Information
              </h2>
            </div>
            <div className="px-6 py-6 space-y-6">
              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address.street"
                    value={profileData.address.street}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={profileData.address.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={profileData.address.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="State"
                  />
                </div>
              </div>

              {/* ZIP and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={profileData.address.zipCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={profileData.address.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Newsletter
                </label>
                <p className="text-sm text-gray-500">
                  Receive updates about new products and offers
                </p>
              </div>
              <input
                type="checkbox"
                name="preferences.newsletter"
                checked={profileData.preferences.newsletter}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Get notified about order updates and promotions
                </p>
              </div>
              <input
                type="checkbox"
                name="preferences.notifications"
                checked={profileData.preferences.notifications}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  SMS Updates
                </label>
                <p className="text-sm text-gray-500">
                  Receive SMS notifications for important updates
                </p>
              </div>
              <input
                type="checkbox"
                name="preferences.smsUpdates"
                checked={profileData.preferences.smsUpdates}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
