import User from "../models/User.js";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, secondName, email } = req.body;

  if (!firstName || !secondName || !email) {
    return res.status(400).json({ message: "First name, second name, and email are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.first_name = firstName.trim();
    user.second_name = secondName.trim();
    user.email = email.toLowerCase().trim();

    if (req.file) {
      const origin = `${req.protocol}://${req.get("host")}`;
      user.profile_image = `${origin}/assets/profile_imgs/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      second_name: user.second_name,
      email: user.email,
      gender: user.gender,
      is_admin: user.is_admin,
      profile_image: user.profile_image,
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const err = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: err });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getProfile, updateProfile };
