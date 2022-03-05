import User from "../models/User.js";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";

//auth/sign-up
export const SignUp = async (req, res) => {
  
  if (req.body.email.length == 0 || req.body.username.length == 0) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(400).json({ message: "All field are required!" });
  }

  if (req.body.password.length < 6) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(400).json({ message: "Password must be longer than 5" });
  }

  var emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  let parts = req.body.email.split("@");
  let emailFailed = "Email is not valid"
  let domainParts = req.body.email.split(".");

  if (req.body.email != undefined) {
    if (req.body.email.length > 254 || parts[0].length > 64) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(400).json({ message: emailFailed });
    }
  }

  if (!emailRegex.test(req.body.email)) {
    res.setHeader('Content-Type', 'application/json')
      return  res.status(400).json({ message: emailFailed });
  }

  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  ) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(400).json({ message: emailFailed });
  }

  let password = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.PRIVATE_KEY
  ).toString();

  let user = new User({
    username: req.body.username,
    email: req.body.email,
    password: password,
    avatar: req.body.avatar,
    isAdmin: req.body.isAdmin,
  });

  try {

      User.find({username : req.body.username}, function (err, docs) {
          if (!docs.length){
            const newUser =  user.save();
            res.status(200).json(newUser);
          }else{                
            res.setHeader('Content-Type', 'application/json')
            return  res.status(400).json({ message: "User already exist" });
          }
      });

  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ message: error.message });
  }
};

//auth/sign-in
export const SignIn = async (req, res) => {
  try {
    const passwords   = req.body.password

    let user = await User.findOne({ username: req.body.username });
    
    if (!user) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(404).json({ message: "User not found!" });
    }

    let bytes = CryptoJS.AES.decrypt(user.password, process.env.PRIVATE_KEY);
    let validatePassword = bytes.toString(CryptoJS.enc.Utf8);
    
    if (validatePassword !== passwords) {
       res.setHeader('Content-Type', 'application/json')
       return res.status(400).json({ message: " Wrong password" });
    }

    const { password, ...data } = user._doc;
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json(data);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ message: error.message });
  }
};

//auth/who-i-am
export const WhoIAm = async (req, res) => {
  const { id, passwordRequired } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) { 
        res.setHeader('Content-Type', 'application/json')
        return  res.status(404).json({ message: "User not found!" });
  }

    if (passwordRequired) {
      return  res.status(200).json(user);
    }

    let { password, ...data } = user._doc;
    return  res.status(200).json(data);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/request-email-verification
export const RequestEmailVerification = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) {
       res.setHeader('Content-Type', 'application/json')
       return  res.status(404).json({ message: "User not found!" });
    }

    let email = user.email;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jasampogodinko1234@gmail.com",
        pass: "Jasam1234#",
      },
    });

    let info = await transporter.sendMail({
      from: req.body.from,
      to: email,
      subject: req.body.subject,
      text: req.body.text,
    });

    return  res.status(200).json({
      messageId: info.messageId,
      messageUrl: nodemailer.getTestMessageUrl(info),
    });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return    res.status(500).json({ message: error.message });
  }
};

//auth/verify-registration-code
export const VerifyRegistrationCode = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      return   res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) { 
       res.setHeader('Content-Type', 'application/json')
       return   res.status(404).json({ message: "User not found!" });
    }

    let playlists = await Playlist.find({ user: user });
    let execute = false

    if (req.body.code == req.body.inputCode) {
     User.findByIdAndUpdate(
        id,
        { verified: true, changedAt: Date.now() },
        (err, docs) => {
          if (err) {
            res.setHeader('Content-Type', 'application/json')
            return  res.status(400).json({ message: "Error! Try again" });
          } else {
            execute = true
            res.json(200).json({ message: "Verified" });
          }
        }
      );
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.json(400).json({ message: "Wrong code!" });
    }

    user = await User.findById(id);

    if (execute) {
    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return  res.status(400).json(err);
            } else {
              return  res.status(200).json(docs);
            }
          }
        );
      });
    }
  }
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/change-password
export const ChangePassword = async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) { 
       res.setHeader('Content-Type', 'application/json')
      res.status(404).json({ message: "User not found" });
    }

    let getOldPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PRIVATE_KEY
    );
    let validateOldPassword = getOldPass.toString(CryptoJS.enc.Utf8);

    if (validateOldPassword != oldPassword) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (newPassword.length < 6) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(400).json({ message: "Password must be longer than 5" });
    }

    let hashNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PRIVATE_KEY
    ).toString();

    user = await User.findById(id);
    let playlists = await Playlist.find({ user: user });
    let execute = false

    if (validateOldPassword == oldPassword) {
   User.findByIdAndUpdate(
      id,
      { password: hashNewPassword, changedAt: Date.now() },
      (err, docs) => {
        if (err) {
          res.setHeader('Content-Type', 'application/json')
          return  res.status(400).json({ message: "Error! Try again" });
        } else {
          execute = true
          return res.status(200).json({ message: "Password changed" });
        }
      }
    );
    
    user = await User.findById(id);

    if (execute) {
    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return  res.status(400).json(err);
            } else {
              return  res.status(200).json(docs);
            }
          }
        );
      });
    }
  }
}
return  res.status(200).json({ message: "Password changed" });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return   res.status(500).json({ message: error.message });
  }
};

//auth/api/auth/request-forgot-password-email
export const RequestForgotPasswordEmail = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) { 
    res.setHeader('Content-Type', 'application/json')
    return  res.status(404).json({ message: "User not found" }); 
  }

    let { email } = user;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jasampogodinko1234@gmail.com",
        pass: "Jasam1234#",
      },
    });

    let info = await transporter.sendMail({
      from: req.body.from,
      to: email,
      subject: req.body.subject,
    });

    res.status(200).json({
      messageId: info.messageId,
      messageUrl: nodemailer.getTestMessageUrl(info),
    });

    const mail = await transporter.sendMail({
      from: req.body.from,
      to: email,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });

    res.status(200).json({
      messageId: mail.messageId,
      messageUrl: nodemailer.getTestMessageUrl(mail),
    });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/forgot-password
export const ForgotPassword = async (req, res) => {
  const { id, newPassword } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    if (!user) { 
    res.setHeader('Content-Type', 'application/json')
    return res.status(404).json({ message: "User not found!" });
    }

    if (newPassword.length < 6) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(400).json({ message: "Password must be longer than 5" });
    }

    let hashedNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PRIVATE_KEY
    ).toString();

    user = await User.findById(id);
    let playlists = await Playlist.find({ user: user });
    let execute = false

    if (req.body.code == req.body.inputCode) {
       User.findByIdAndUpdate(
        id,
        { password: hashedNewPassword, changedAt: Date.now() },
        (err, docs) => {
          if (err) {
            res.setHeader('Content-Type', 'application/json')
            return  res.status(400).json({ message: "Error! Try again" });
          } else {
            execute = true
            res.json(200).json({ message: "Password changed" });
          }
        }
      );
    } else {
      res.setHeader('Content-Type', 'application/json')
      return  res.json(400).json({ message: "Wrong code!" });
    }

    user = await User.findById(id);

    if (execute) {
    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return res.status(400).json(err);
            } else {
              res.status(200).json(docs);
            }
          }
        );
      });
    }
  }
    res.json(200).json({ message: "Verified" });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/delete-user
export const DeleteUser = async (req, res) => {
  const { id } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    let playlists = await Playlist.find({ user: user });

     User.findByIdAndDelete(id, (error, docs) => {
      if (error) {
        res.setHeader('Content-Type', 'application/json')
        return  res.status(400).json({ message: "Error, try again!" });
      } else {
        res.status(200).json(docs);
      }
    });

    user = await User.findById(id);

    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return  res.status(400).json(err);
            } else {
              res.status(200).json(docs);
            }
          }
        );
      });
    }
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/change-username
export const ChangeUsername = async (req, res) => {
  const { id, newUsername } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      res.setHeader('Content-Type', 'application/json')
      return  res.status(404).json({ message: "User not found!" });
    }

    (await User.find()).forEach((user) => {
      if (user.username == newUsername) {
        res.setHeader('Content-Type', 'application/json')
        return  res.status(400).json({ message: "Username is taken!" });
      }
    });

    let user = await User.findById(id);
    let playlists = await Playlist.find({ user: user });

    let execute = false

     User.findByIdAndUpdate(
      id,
      { username: newUsername, changedAt: Date.now() },
      (error, docs) => {
        if (error) {
          res.setHeader('Content-Type', 'application/json')
          return res.status(400).json({ message: "Error, try again!" });
        } else {
          res.status(200).json(docs);
          execute = true
        }
      }
    );

    user = await User.findById(id);

    if (execute) {
    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return res.status(400).json(err);
            } else {
              res.status(200).json(docs);
            }
          }
        );
      });
    }
   }
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ message: error.message });
  }
};

//auth/change-avatar
export const ChangeAvatar = async (req, res) => {
  const { id, avatar } = req.body;

  try {
    if (!mongoose.Types.ObjectId(id)) {
      return res.status(404).json({ message: "User not found!" });
    }

    let user = await User.findById(id);
    let playlists = await Playlist.find({ user: user });

    let execute = false

     User.findByIdAndUpdate(
      id,
      { avatar: avatar, changedAt: Date.now() },
      (error, docs) => {
        if (error) {
          res.setHeader('Content-Type', 'application/json')
          return  res.status(400).json({ message: "Error, try again!" });
        } else {
          execute = true
          res.status(200).json(docs);
        }
      }
    );

    user = await User.findById(id);

    if (execute) {
    if (playlists.length > 0) {
      playlists.forEach((playlist) => {
        Playlist.findByIdAndUpdate(
          playlist._id,
          { user: user },
          (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return res.status(400).json(err);
            } else {
              res.status(200).json(docs);
            }
          }
        );
      });
    }
  }
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ message: error.message });
  }
};

//auth/list-users
export const ListUsers = async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return  res.status(500).json({ message: error.message });
  }
};

//auth/delete-multiple-users
export const DeleteMultipleUsers = async (req, res) => {
  const { ids } = req.body;

  try {
    ids.forEach((id) => {
      let user = User.findById(id);

      let playlists = Playlist.find({ user: user });

      if (playlists.length > 0) {
        playlists.forEach((playlist) => {
          Playlist.findByIdAndDelete(playlist._id, (error, docs) => {
            if (error) {
              res.setHeader('Content-Type', 'application/json')
              return   res.status(400).json(err);
            } else {
              res.status(200).json(docs);
            }
          });
        });
      }

      User.findByIdAndDelete(id, (error, docs) => {
        if (error) {
          res.setHeader('Content-Type', 'application/json')
          return  res.status(400).json(err);
        } else {
          res.status(200).json({ message: id + "deleted" });
        }
      });
    });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ message: error.message });
  }
};
