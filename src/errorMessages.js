const dataNotSent = 'This property has been ignored.';

export default {
  init: `Invalid account id`,
  event: `Event structure not valid. Unable to process event`,
  gender: `Gender value should be either M or F. ${dataNotSent}`,
  employed: `Employed value should be either Y or N. ${dataNotSent}`,
  married: `Married value should be either Y or N. ${dataNotSent}`,
  education: `Education value should be either School, College or Graduate. ${dataNotSent}`,
  age: `Age value should be a number. ${dataNotSent}`,
  dob: `DOB value should be a Date Object`,
  objArr: `Expecting Object array in profile`,
  dateFormat: `setDate(number). number should be formatted as yyyymmdd`,
  enumFormat: `setEnum(value). value should be a string or a number`,
  phoneFormat: `Phone number should be formatted as +[country code][number]`,
};
