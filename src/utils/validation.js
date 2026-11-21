import { URGENCY_LEVELS, UNITS_LIMITS } from './constants.js'

export function isBlank(value) {
    return typeof value !=='string' || value.trim() =='';
}

export function isValidEmail (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export function validateLogin({email,password}) {
    const errors = {};
    if (isBlank(email)) {
        errors.email= 'Email is required';
    } else if (!isValidEmail(email)) {
        errors.email= 'Enter a valid email address';
    }

    if (isBlank(password)) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'password must be at least 6 characters';
    }

    return errors;
}

export function validateRegister ({ name, email, password, confirmPassword }) {
    const errors = {};

    if(isBlank(name)) {
        errors.name = 'Full name is reqired';
    } else if (name.trim().length < 3){
        errors.name ='Name is too short';
    }
    if (isBlank(email)) {
        errors.email = 'Enter a valid email address';
    }

    if (isBlank(Password)) {
        errors.password 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (isBlank(confirmPassword)) {
        errors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors ;
}

export function validateAppeal ({
    patientName,
    hospital,
    county,
    bloodtype,
    contactPhone,
    units,
    urgency,
}) {
    const errors ={};

    if (isBlank(patientName)) {
        errors.patientName = 'Patient name is required';
    }
     if (isBlank(hospital)) {
        errors.hospital = 'Hospital is reqired'
     }
     if (isBlank(county)) {
        errors.county = 'select a county';
     }
     
     if (isBlank(bloodType)) {
        errors.bloodType = 'select a blood type'
     }

     const phone = String (contactPhone || '').trim();
     if (isBlank(phone)){
        errors.contactPhone =  'Contact phone is reqired';
     } else if (!/^0[17]\d{8}$/.test(phone)) {
        errors.contactPhone = 'use a kenyan number like 0712345678';
      }

      const count = Number(units);
      if (!Number.isInteger(count)){
        errors,units = 'units must be a whole number';
    }else if (count < units.LIMITS.min || count > UNITS_LIMITS.LIMITS.max){
        errors.units = `Units must be between ${UNIT_LIMITS.min} and ${UNIT_LIMITS.max}`;
    }

    if  (urgency && !URGENCY_LEVELS.some((level) => level.value === urgency)) {
    errors.urgency = 'Select an urgency level';
    }

    return errors;
}
