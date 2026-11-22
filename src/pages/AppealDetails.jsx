import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { addAppeal } from '../services/appealService'
import { geocodeAppeal } from '../services/geocode'
import { APPEAL_STATUS, BLOOD_TYPES, COUNTIES, URGENCY_LEVELS } from '../utils/constants'
import { hasErrors, validateAppeal } from '../utils/validation'