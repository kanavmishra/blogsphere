import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import BlogCard from "../components/BlogCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const loggedInUser = currentUser;

  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // profile, edit, activity, settings

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    location: "",
    profilePictureUrl: "", // Avatar image URL
    coverImageUrl: "", // Banner image URL
    social: {
      github: "",
      linkedin: "",
      twitter: "",
      website: "",
    },
  });

  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    suggestions: [],
    message: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [privacyForm, setPrivacyForm] = useState({
    showEmail: true,
    publicActivity: true,
    newsletter: true,
    commentAlerts: true,
  });

  // User activity states
  const [activity, setActivity] = useState({
    drafts: [],
    likedBlogs: [],
    comments: [],
  });
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchActivity = async () => {
  try {
    setActivityLoading(true);

    const res = await API.get("/users/profile/activity");

    setActivity({
      drafts: res.data.drafts || [],
      likedBlogs: res.data.likedBlogs || [],
      comments: res.data.comments || [],
    });
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to load activity"
    );
  } finally {
    setActivityLoading(false);
  }
};

  const isOwnProfile = currentUser && (currentUser.id === id || currentUser._id === id);

  const isFollowing = user?.followers?.some(
    (followerId) => followerId.toString() === currentUser?.id || followerId.toString() === currentUser?._id
  );

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        const res = await API.post(`/users/${id}/unfollow`);
        toast.success("Unfollowed user successfully");
        setUser(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(fid => fid !== (currentUser?.id || currentUser?._id)),
          stats: {
            ...prev.stats,
            followersCount: res.data.followersCount
          }
        }));
      } else {
        const res = await API.post(`/users/${id}/follow`);
        toast.success("Followed user successfully");
        setUser(prev => ({
          ...prev,
          followers: [...(prev.followers || []), (currentUser?.id || currentUser?._id)],
          stats: {
            ...prev.stats,
            followersCount: res.data.followersCount
          }
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  };

  useEffect(() => {
  fetchProfile();
}, [id]);

useEffect(() => {
  if (activeTab === "activity" && isOwnProfile) {
    fetchActivity();
  }
}, [activeTab]);

  const checkUsernameAvailability = async (usernameVal) => {
    const cleanUsername = usernameVal.trim().toLowerCase();
    if (!cleanUsername) {
      setUsernameStatus({ checking: false, available: null, suggestions: [], message: "" });
      return;
    }
    if (cleanUsername === user?.username) {
      setUsernameStatus({ checking: false, available: true, suggestions: [], message: "This is your current username" });
      return;
    }

    setUsernameStatus(prev => ({ ...prev, checking: true, available: null, message: "" }));
    try {
      const res = await API.get(`/users/check-username?username=${encodeURIComponent(cleanUsername)}`);
      setUsernameStatus({
        checking: false,
        available: res.data.available,
        suggestions: res.data.suggestions || [],
        message: res.data.message,
      });
    } catch (err) {
      setUsernameStatus({
        checking: false,
        available: false,
        suggestions: err.response?.data?.suggestions || [],
        message: err.response?.data?.message || "Error checking username",
      });
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/${id}`);
      setUser(res.data.user);
      setBlogs(res.data.blogs || []);

      if (res.data.user) {
        setProfileForm({
          fullName: res.data.user.fullName || res.data.user.name || "",
          username: res.data.user.username || "",
          bio: res.data.user.bio || "",
          location: res.data.user.location || "",
          profilePictureUrl: res.data.user.profilePictureUrl || "",
          coverImageUrl: res.data.user.coverImageUrl || "",
          social: {
            github: res.data.user.social?.github || "",
            linkedin: res.data.user.social?.linkedin || "",
            twitter: res.data.user.social?.twitter || "",
            website: res.data.user.social?.website || "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update all profile details in a single API call
      await API.put("/users/profile", {
        username: profileForm.username,
        fullName: profileForm.fullName,
        bio: profileForm.bio,
        location: profileForm.location,
        social: profileForm.social,
        profilePictureUrl: profileForm.profilePictureUrl,
        coverImageUrl: profileForm.coverImageUrl,
      });

      toast.success("Profile updated successfully!");
      fetchProfile();
      setActiveTab("profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      await API.put("/users/profile/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };
   
  const handleProfilePicture = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await API.put(
      "/users/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Profile picture updated!");

    setUser((prev) => ({
      ...prev,
      profilePictureUrl: res.data.user.profilePictureUrl,
    }));
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Upload failed"
    );
  }
};



const handleCoverPicture = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await API.put(
      "/users/profile/cover",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Cover image updated!");

    setUser((prev) => ({
      ...prev,
      coverImageUrl: res.data.user.coverImageUrl,
    }));
  } catch (err) {
    toast.error(err.response?.data?.message || "Upload failed");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-bg text-center px-6">
        <span className="text-6xl mb-6">🔍</span>
        <h1 className="text-4xl font-poppins font-black text-brand-text">User Not Found</h1>
        <Link to="/" className="mt-8 bg-purple-primary hover:bg-purple-primary/90 text-white px-6 py-3 rounded-full font-semibold transition shadow-md glow-button-purple">
          Back to Home
        </Link>
      </div>
    );
  }

  const defaultBanner = "bg-gradient-to-r from-[#2D1B69] via-purple-primary to-rose-gold opacity-80";
  const avatarImage = user.avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5b2eff&color=ffffff&size=256`;

  return (
    <div className="bg-brand-bg min-h-screen pb-24 font-sans">
      {/* Cover Banner */}
      <div className="relative h-72 rounded-3xl overflow-hidden mb-24">

  {user.coverImageUrl ? (
    <img
      src={user.coverImageUrl}
      alt="Cover"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-[#5B2EFF] via-[#8B5CF6] to-[#E9D5FF]" />
  )}

  <div className="absolute inset-0 bg-black/20"></div>

  {isOwnProfile && (
    <>
      <label
        htmlFor="cover-upload"
        className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-lg"
      >
        📷 Change Cover
      </label>

      <input
        id="cover-upload"
        type="file"
        accept="image/*"
        onChange={handleCoverPicture}
        className="hidden"
      />
    </>
  )}

</div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10 animate-reveal">
        {/* Profile Details Block */}
        <div className="glass-card rounded-3xl p-8 shadow-md mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-brand-border/60">
           <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">

  <div className="relative w-28 h-28">
    {user.profilePictureUrl ? (
      <img
        src={user.profilePictureUrl}
        alt={user.name}
        className="w-28 h-28 rounded-full object-cover border-4 border-orange-500"
      />
    ) : (
      <div className="w-28 h-28 rounded-full bg-orange-600 flex items-center justify-center text-4xl font-bold text-white">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}

    {isOwnProfile && (
      <>
        <label
          htmlFor="profile-upload"
          className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 shadow-lg"
        >
          📷
        </label>

        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleProfilePicture}
          className="hidden"
        />
      </>
    )}
  </div>

  <div>
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
      <h1 className="text-3xl font-poppins font-black text-brand-text">
        {user.fullName || user.name}
      </h1>

      {user.username && (
        <span className="text-xs font-semibold px-3 py-1 bg-purple-lilac/30 text-purple-deep border border-purple-lilac/60 rounded-full">
          @{user.username}
        </span>
      )}
    </div>

    <p className="text-brand-muted text-sm mt-2 flex flex-wrap justify-center md:justify-start gap-4">
      {privacyForm.showEmail && <span>📧 {user.email}</span>}
      {user.location && <span>📍 {user.location}</span>}
    </p>

    {user.bio ? (
      <p className="text-brand-muted text-sm mt-3 max-w-xl leading-relaxed italic">
        "{user.bio}"
      </p>
    ) : (
      <p className="text-brand-muted/50 text-xs mt-3 italic">
        No bio written yet.
      </p>
    )}
  </div>
</div>

            {/* Engagement statistics */}
            <div className="flex flex-col items-center gap-4">
              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className={`w-full md:w-auto px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                    isFollowing
                      ? "bg-[#FCEBEA] border border-[#E9C7C5] text-[#7A3633] hover:bg-[#F2DBDA]"
                      : "bg-purple-primary hover:bg-purple-primary/95 text-white glow-button-purple"
                  }`}
                >
                  {isFollowing ? "👤 Unfollow" : "👤 Follow"}
                </button>
              )}
              <div className="flex flex-wrap justify-center gap-4 bg-brand-bg p-4 rounded-2xl border border-brand-border">
              <div className="text-center px-4">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Posts</span>
                <span className="text-xl font-bold text-brand-text block mt-1">{user.stats?.postsCount || blogs.length}</span>
              </div>
              <div className="text-center px-4 border-l border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Likes Recd</span>
                <span className="text-xl font-bold text-brand-text block mt-1">{user.stats?.likesReceived || 0}</span>
              </div>
              <div className="text-center px-4 border-l border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Followers</span>
                <span className="text-xl font-bold text-brand-text block mt-1">{user.stats?.followersCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Social Links Row */}
          {user.social && (Object.values(user.social).some(v => v)) && (
            <div className="flex flex-wrap items-center gap-3 pt-6">
              <span className="text-xs font-bold text-brand-muted mr-2">Connect:</span>
              {user.social.github && (
                <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-text hover:text-purple-primary transition">
                  🖥️ GitHub
                </a>
              )}
              {user.social.linkedin && (
                <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-text hover:text-purple-primary transition">
                  💼 LinkedIn
                </a>
              )}
              {user.social.twitter && (
                <a href={user.social.twitter} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-text hover:text-purple-primary transition">
                  🐦 Twitter/X
                </a>
              )}
              {user.social.website && (
                <a href={user.social.website} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-text hover:text-purple-primary transition">
                  🌐 Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tab Selector for Logged-In Owner */}
        {isOwnProfile ? (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-brand-border">
            {[
              { id: "profile", label: "👤 View Profile" },
              { id: "edit", label: "✏️ Edit Details" },
              { id: "activity", label: "📈 Activity Feed" },
              { id: "settings", label: "⚙️ Account Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-purple-primary text-white shadow-sm"
                    : "bg-brand-card text-brand-muted border border-brand-border hover:bg-purple-lilac/30 hover:text-brand-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        {/* TAB CONTENTS */}

        {/* Tab 1: Profile View */}
        {activeTab === "profile" && (
          <div>
            <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-8">
              <h2 className="text-2xl font-poppins font-bold text-brand-text">
                Published Articles
              </h2>
              <span className="bg-purple-lilac/30 border border-purple-lilac/60 text-purple-deep text-xs font-semibold px-4 py-1.5 rounded-full">
                {blogs.length} Articles
              </span>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-20 bg-brand-card border border-brand-border border-dashed rounded-3xl text-brand-muted p-6">
                No articles published yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Edit Profile Form */}
        {activeTab === "edit" && isOwnProfile && (
          <div className="glass-card rounded-3xl p-6 md:p-10">
            <h2 className="text-2xl font-poppins font-bold text-brand-text mb-6">
              ✏️ Update Profile Details
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Username
                    </label>
                    <button
                      type="button"
                      onClick={() => checkUsernameAvailability(profileForm.username)}
                      disabled={usernameStatus.checking}
                      className="text-[10px] font-bold text-purple-primary hover:text-purple-primary/80 uppercase tracking-wider cursor-pointer"
                    >
                      {usernameStatus.checking ? "Checking..." : "🔎 Check Availability"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, username: e.target.value });
                      setUsernameStatus({ checking: false, available: null, suggestions: [], message: "" });
                    }}
                    placeholder="e.g. dev_innovator"
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                  {usernameStatus.message && (
                    <p className={`text-[10px] mt-1.5 font-semibold ${usernameStatus.available ? "text-green-600" : "text-red-500"}`}>
                      {usernameStatus.available ? "✅ " : "❌ "} {usernameStatus.message}
                    </p>
                  )}
                  {usernameStatus.suggestions.length > 0 && (
                    <div className="mt-2 p-3 bg-purple-lilac/10 border border-purple-lilac/30 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-deep block mb-1.5">💡 Suggested Available Usernames:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {usernameStatus.suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setProfileForm({ ...profileForm, username: sug });
                              setUsernameStatus({ checking: false, available: true, suggestions: [], message: "Selected username suggestion" });
                            }}
                            className="px-2.5 py-1 bg-brand-card hover:bg-purple-lilac/20 border border-brand-border hover:border-purple-lilac rounded-lg text-[10px] font-medium transition cursor-pointer text-brand-text"
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                  Bio / Tagline
                </label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell readers about yourself in a short tagline..."
                  className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-primary/50 text-sm leading-relaxed"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    list="location-options"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="Search or enter location (e.g. San Francisco, CA)"
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                  <datalist id="location-options">
                    <option value="San Francisco, USA" />
                    <option value="New York, USA" />
                    <option value="Seattle, USA" />
                    <option value="London, United Kingdom" />
                    <option value="Berlin, Germany" />
                    <option value="Paris, France" />
                    <option value="Bengaluru, India" />
                    <option value="New Delhi, India" />
                    <option value="Tokyo, Japan" />
                    <option value="Singapore" />
                    <option value="Sydney, Australia" />
                    <option value="Toronto, Canada" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.social.website}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, website: e.target.value }
                    })}
                    placeholder="https://mywebsite.com"
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 border-t border-brand-border pt-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Avatar Picture URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.profilePictureUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, profilePictureUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Banner Cover URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.coverImageUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, coverImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                  />
                </div>
              </div>

              <div className="border-t border-brand-border pt-6">
                <h3 className="text-sm font-bold text-brand-text mb-4">🔗 Social Media Links</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-2">GitHub</label>
                    <input
                      type="url"
                      value={profileForm.social.github}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        social: { ...profileForm.social, github: e.target.value }
                      })}
                      placeholder="https://github.com/..."
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 focus:outline-none text-xs focus:ring-2 focus:ring-purple-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={profileForm.social.linkedin}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        social: { ...profileForm.social, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 focus:outline-none text-xs focus:ring-2 focus:ring-purple-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-2">Twitter / X</label>
                    <input
                      type="url"
                      value={profileForm.social.twitter}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        social: { ...profileForm.social, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/..."
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 focus:outline-none text-xs focus:ring-2 focus:ring-purple-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-brand-border">
                <button
                  type="submit"
                  className="bg-purple-primary hover:bg-purple-primary/95 text-white font-semibold px-6 py-3 rounded-full transition shadow-md glow-button-purple cursor-pointer text-xs"
                >
                  Save Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="border border-brand-border bg-brand-bg hover:bg-brand-border/40 text-brand-muted px-5 py-3 rounded-full text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Account Activity Feed */}
        {activeTab === "activity" && isOwnProfile && (
          <div className="space-y-10">
            {/* Drafts Section */}
            <div>
              <h3 className="text-xl font-poppins font-bold text-brand-text mb-4 flex items-center gap-2">
                📝 My Saved Drafts
              </h3>

              {activityLoading ? (
                <div className="animate-pulse h-12 bg-brand-card border border-brand-border rounded-xl"></div>
              ) : activity.drafts.length === 0 ? (
                <p className="text-brand-muted text-xs bg-brand-card/30 border border-brand-border border-dashed rounded-2xl p-6 text-center">No drafts saved.</p>
              ) : (
                <div className="space-y-3">
                  {activity.drafts.map((draft) => (
                    <div key={draft._id} className="bg-brand-card border border-brand-border rounded-xl p-4 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-sm font-poppins font-bold text-brand-text">{draft.title}</h4>
                        <p className="text-[10px] text-brand-muted mt-1">Last edited on {new Date(draft.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <Link
                        to={`/edit-blog/${draft._id}`}
                        className="bg-purple-lilac/30 hover:bg-purple-lilac/50 text-purple-deep border border-purple-lilac/60 text-xs font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Edit Draft
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liked Blogs Section */}
            <div>
              <h3 className="text-xl font-poppins font-bold text-brand-text mb-4 flex items-center gap-2">
                ❤️ Liked Articles
              </h3>

              {activityLoading ? (
                <div className="animate-pulse h-12 bg-brand-card border border-brand-border rounded-xl"></div>
              ) : activity.likedBlogs.length === 0 ? (
                <p className="text-brand-muted text-xs bg-brand-card/30 border border-brand-border border-dashed rounded-2xl p-6 text-center">No liked articles yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {activity.likedBlogs.map((liked) => (
                    <div key={liked._id} className="bg-brand-card border border-brand-border rounded-2xl p-5 flex flex-col justify-between hover:border-purple-primary/30 transition">
                      <div>
                        <span className="text-[9px] font-bold text-rose-gold uppercase tracking-wide">{liked.category}</span>
                        <h4 className="text-sm font-poppins font-bold text-brand-text mt-1.5 hover:text-purple-primary transition">
                          <Link to={`/blog/${liked._id}`}>{liked.title}</Link>
                        </h4>
                      </div>
                      <span className="text-[10px] text-brand-muted mt-3">By {liked.author?.name || "Author"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments History */}
            <div>
              <h3 className="text-xl font-poppins font-bold text-brand-text mb-4 flex items-center gap-2">
                💬 Comment History
              </h3>

              {activityLoading ? (
                <div className="animate-pulse h-12 bg-brand-card border border-brand-border rounded-xl"></div>
              ) : activity.comments.length === 0 ? (
                <p className="text-brand-muted text-xs bg-brand-card/30 border border-brand-border border-dashed rounded-2xl p-6 text-center">No comment history available.</p>
              ) : (
                <div className="space-y-3">
                  {activity.comments.map((comment) => (
                    <div key={comment._id} className="bg-brand-card border border-brand-border rounded-xl p-5">
                      <div className="flex justify-between items-center text-[10px] text-brand-muted pb-2 border-b border-brand-border/60">
                        <span>On blog: <Link to={`/blog/${comment.blog?._id}`} className="font-bold hover:text-purple-primary transition">"{comment.blog?.title || "Article"}"</Link></span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-xs md:text-sm text-brand-text leading-relaxed font-sans italic">
                        "{comment.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Settings Section */}
        {activeTab === "settings" && isOwnProfile && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Account settings */}
            <div className="md:col-span-2 space-y-8">
              {/* Privacy settings */}
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-poppins font-bold text-brand-text mb-4">🔒 Privacy & Email Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-text block">Display Email on Profile</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed mt-0.5">Let visitors find your contact email directly on your page.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.showEmail}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, showEmail: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-primary focus:ring-purple-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-brand-border/60 pt-4">
                    <div>
                      <span className="text-xs font-bold text-brand-text block">Public Activity Feed</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed mt-0.5">Show public listings of your liked posts and comments.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.publicActivity}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, publicActivity: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-primary focus:ring-purple-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-poppins font-bold text-brand-text mb-4">🔔 Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-text block">Weekly Newsletter subscription</span>
                      <p className="text-[10px] text-brand-muted mt-0.5">Receive digests of trending tech stories directly in your inbox.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.newsletter}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, newsletter: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-primary focus:ring-purple-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-brand-border/60 pt-4">
                    <div>
                      <span className="text-xs font-bold text-brand-text block">Comments Alerts</span>
                      <p className="text-[10px] text-brand-muted mt-0.5">Get instant notifications when readers comment on your stories.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.commentAlerts}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, commentAlerts: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-primary focus:ring-purple-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Change password sidebar */}
            <div className="md:col-span-1">
              <div className="glass-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-poppins font-bold text-brand-text mb-4">🔑 Change Account Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-brand-bg text-brand-text placeholder-brand-muted/70 border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-primary text-white text-xs font-semibold py-2.5 rounded-xl transition duration-300 shadow-md hover:shadow-lg hover:bg-purple-primary/95 glow-button-purple cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-purple-primary transition font-medium"
          >
            ← Back Home
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}


export default Profile;