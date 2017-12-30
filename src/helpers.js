import Constants from './constants';
import LZS from './LZS';
import Utils from './utils';

export default {
    compressData: function (dataObject) {
      Utils.log.debug('dobj:' + dataObject);
      return LZS.compressToBase64(dataObject);
    },
    // profile like https://developers.google.com/+/api/latest/people
    processGPlusUserObj: function (user) {
      var profileData = {};
      if (typeof user.displayName !== Constants.UNDEFINED) {
          profileData.Name = user.displayName;
      }
      if (typeof user.id !== Constants.UNDEFINED) {
          profileData.GPID = user.id + "";
      }

      if (typeof user.gender !== Constants.UNDEFINED) {
          if (user.gender === "male") {
              profileData.Gender = "M";
          } else if (user.gender === "female") {
              profileData.Gender = "F";
          } else if (user.gender === "other") {
              profileData.Gender = "O";
          }
      }

      if (typeof user.image !== Constants.UNDEFINED) {
          if (!user.image.isDefault) {
              profileData.Photo = user.image.url.split('?sz')[0];
          }
      }

      if (typeof user.emails !== Constants.UNDEFINED) {
          for (var emailIdx = 0; emailIdx < user.emails.length; emailIdx++) {
              var emailObj = user.emails[emailIdx];
              if (emailObj.type === 'account') {
                  profileData.Email = emailObj.value;
              }
          }
      }

      if (user.organizations) {
          profileData.Employed = 'N';
          for (var i = 0; i < user.organizations.length; i++) {
              var orgObj = user.organizations[i];
              if (orgObj.type === 'work') {
                  profileData.Employed = 'Y';
                  break;
              }
          }
      }

      if (user.birthday) {
          var yyyymmdd = user.birthday.split('-'); //comes in as "1976-07-27"
          profileData.DOB = Utils.setDate(yyyymmdd[0] + yyyymmdd[1] + yyyymmdd[2]);
      }

      if (user.relationshipStatus) {
          profileData.Married = 'N';
          if (user.relationshipStatus === 'married') {
              profileData.Married = 'Y';
          }
      }
      Utils.log.debug("gplus usr profile " + JSON.stringify(profileData));

      return profileData;
    },
    processFBUserObj: function (user) {
      var profileData = {};
      profileData.Name = user.name;
      if (user.id) {
          profileData.FBID = user.id + "";
      }
      // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female. Rest we don't care.
      if (user.gender === "male") {
          profileData.Gender = "M";
      } else if (user.gender === "female") {
          profileData.Gender = "F";
      } else {
          profileData.Gender = "O";
      }

      var getHighestEducation = function (eduArr) {
          if (eduArr) {
              var college = "";
              var highschool = "";

              for (var i = 0; i < eduArr.length; i++) {
                  var edu = eduArr[i];
                  if (edu.type) {
                      var type = edu.type;
                      if (type === "Graduate School") {
                          return "Graduate";
                      } else if (type === "College") {
                          college = "1";
                      } else if (type === "High School") {
                          highschool = "1";
                      }
                  }
              }

              if (college === "1") {
                  return "College";
              } else if (highschool === "1") {
                  return "School";
              }
          }
      };

      if (user.relationship_status) {
          profileData.Married = 'N';
          if (user.relationship_status === 'Married') {
              profileData.Married = 'Y';
          }
      }

      var edu = getHighestEducation(user.education);
      if (edu) {
          profileData.Education = edu;
      }

      profileData.Employed = user.work ? 'Y' : 'N';

      if (user.email) {
          profileData.Email = user.email;
      }

      if (user.birthday) {
          var mmddyy = user.birthday.split('/'); //comes in as "08/15/1947"
          profileData.DOB = Utils.setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
      }
      return profileData;
    },
};
