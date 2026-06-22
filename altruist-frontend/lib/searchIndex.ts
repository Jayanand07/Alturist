export interface SearchEntry {
  label: string;
  category: string;
  route: string;
  keywords: string[];
}

export const searchIndex: SearchEntry[] = [
  // ── Pages ────────────────────────────────────────────────────────────────
  { label: "Home",            category: "Page", route: "/",             keywords: ["home", "main", "landing", "start"] },
  { label: "About Us",        category: "Page", route: "/about",        keywords: ["about", "company", "mission", "team", "altruist"] },
  { label: "Health Plans",    category: "Page", route: "/plans",        keywords: ["plans", "pricing", "subscription", "membership", "annual"] },
  { label: "Doctor Vlogs",    category: "Page", route: "/vlogs",        keywords: ["vlogs", "videos", "health tips", "doctor insights", "blog"] },
  { label: "Primary Clinics", category: "Page", route: "/clinics",      keywords: ["clinics", "hospital", "clinic", "offline", "physical"] },
  { label: "Order Medicines", category: "Page", route: "/medicines",    keywords: ["medicines", "pharmacy", "drugs", "tablets", "capsules", "buy medicine"] },
  { label: "Book Lab Tests",  category: "Page", route: "/labs",         keywords: ["lab", "labs", "diagnostic", "tests", "sample", "blood test", "urine test"] },
  { label: "Consult Doctors", category: "Page", route: "/consult",      keywords: ["consult", "consultation", "doctor", "online doctor", "chat doctor"] },
  { label: "Cart",            category: "Page", route: "/cart",         keywords: ["cart", "basket", "order", "checkout"] },

  // ── Doctor Specialties ───────────────────────────────────────────────────
  { label: "General Physician",   category: "Doctor", route: "/consult?specialty=General%20Physician",   keywords: ["gp", "general", "physician", "fever", "cold", "flu", "primary care"] },
  { label: "Dermatologist",       category: "Doctor", route: "/consult?specialty=Dermatologist",          keywords: ["skin", "acne", "rash", "eczema", "hair loss", "derma", "dermato"] },
  { label: "Cardiologist",        category: "Doctor", route: "/consult?specialty=Cardiology",             keywords: ["heart", "cardiac", "chest pain", "blood pressure", "bp", "cardio"] },
  { label: "Neurologist",         category: "Doctor", route: "/consult?specialty=Neurologist",            keywords: ["brain", "headache", "migraine", "nerve", "seizure", "neuro"] },
  { label: "Orthopedic",          category: "Doctor", route: "/consult?specialty=Orthopaedics",           keywords: ["bone", "joint", "knee", "spine", "fracture", "orthopedic", "ortho"] },
  { label: "Gynecologist",        category: "Doctor", route: "/consult?specialty=Gynaecologist",          keywords: ["women", "pregnancy", "period", "gynae", "gynecology", "obstetrics", "pcod"] },
  { label: "Pediatrician",        category: "Doctor", route: "/consult?specialty=Pediatrics",             keywords: ["child", "baby", "infant", "kids", "children", "pediatric"] },
  { label: "Psychiatrist",        category: "Doctor", route: "/consult?specialty=Psychiatry",             keywords: ["mental health", "anxiety", "depression", "stress", "psycho", "therapy"] },
  { label: "ENT Specialist",      category: "Doctor", route: "/consult?specialty=ENT",                    keywords: ["ear", "nose", "throat", "sinus", "tonsil", "ent", "hearing"] },
  { label: "Ophthalmologist",     category: "Doctor", route: "/consult?specialty=Ophthalmology",          keywords: ["eye", "vision", "glasses", "retina", "cataract", "ophthal"] },
  { label: "Diabetologist",       category: "Doctor", route: "/consult?specialty=Diabetology",            keywords: ["diabetes", "sugar", "insulin", "hba1c", "diabetic", "glucose"] },
  { label: "Oncologist",          category: "Doctor", route: "/consult?specialty=Medical%20Oncology",     keywords: ["cancer", "tumor", "chemotherapy", "oncology", "malignant"] },
  { label: "Pulmonologist",       category: "Doctor", route: "/consult?specialty=Pulmonology",            keywords: ["lungs", "asthma", "breathing", "copd", "respiratory", "cough", "pulmo"] },
  { label: "Gastroenterologist",  category: "Doctor", route: "/consult?specialty=Gastroenterology",       keywords: ["stomach", "gut", "ibs", "acidity", "digestion", "liver", "gastro"] },
  { label: "Urologist",           category: "Doctor", route: "/consult?specialty=Urology",                keywords: ["kidney", "bladder", "uti", "urine", "prostate", "uro"] },
  { label: "Rheumatologist",      category: "Doctor", route: "/consult?specialty=Rheumatology",           keywords: ["arthritis", "joint pain", "autoimmune", "rheumatoid", "gout"] },

  // ── Service Categories ───────────────────────────────────────────────────
  { label: "Online Consultation",  category: "Service", route: "/consult",                              keywords: ["online consult", "telemedicine", "telehealth", "video doctor", "chat"] },
  { label: "Lab Tests",            category: "Service", route: "/labs",                                 keywords: ["book lab", "home sample", "diagnostics", "nabl lab", "blood test"] },
  { label: "Full Body Checkup",    category: "Service", route: "/labs?search=full+body",                keywords: ["full body", "health checkup", "comprehensive test", "annual checkup"] },
  { label: "Health Screening",     category: "Service", route: "/labs?search=health+screen",            keywords: ["screening", "preventive", "health scan", "wellness check"] },
  { label: "Medicine Delivery",    category: "Service", route: "/medicines",                            keywords: ["delivery", "medicine home", "drug delivery", "pharmacy delivery", "2hr"] },
  { label: "Upload Prescription",  category: "Service", route: "/medicines",                            keywords: ["prescription", "upload rx", "pharmacist", "rx order"] },
  { label: "Primary Clinics",      category: "Service", route: "/clinics",                              keywords: ["clinic", "walk-in", "near me", "physical visit", "in-person"] },
  { label: "Doctor Video Consult", category: "Service", route: "/consult",                              keywords: ["video consult", "video call", "virtual doctor", "video appointment"] },

  // ── Medicine Categories ──────────────────────────────────────────────────
  { label: "Cold & Flu Medicines",      category: "Medicine", route: "/medicines?search=cold",           keywords: ["cold", "flu", "fever", "paracetamol", "cough syrup", "viral"] },
  { label: "Diabetes Care",             category: "Medicine", route: "/medicines?category=Diabetes%20Care", keywords: ["diabetes", "sugar", "metformin", "insulin", "glucometer", "diabetic strips"] },
  { label: "Blood Pressure Medicines",  category: "Medicine", route: "/medicines?search=blood+pressure",  keywords: ["blood pressure", "bp", "hypertension", "amlodipine", "losartan"] },
  { label: "Vitamins & Supplements",    category: "Medicine", route: "/medicines?category=Vitamins",      keywords: ["vitamins", "supplements", "vitamin d", "vitamin b12", "multivitamin", "calcium"] },
  { label: "Skincare Products",         category: "Medicine", route: "/medicines?search=skincare",        keywords: ["skincare", "sunscreen", "moisturizer", "cetaphil", "acne cream", "face wash"] },
  { label: "Pain Relief",               category: "Medicine", route: "/medicines?search=pain+relief",     keywords: ["pain", "analgesic", "ibuprofen", "pain killer", "muscle pain", "sprain"] },
  { label: "Antibiotics",               category: "Medicine", route: "/medicines?search=antibiotics",     keywords: ["antibiotic", "infection", "amoxicillin", "azithromycin", "bacterial"] },
  { label: "Ayurvedic Products",        category: "Medicine", route: "/medicines?search=ayurvedic",       keywords: ["ayurvedic", "herbal", "natural", "ashwagandha", "triphala", "ayurveda"] },
  { label: "Digestive Care",            category: "Medicine", route: "/medicines?search=digestive",       keywords: ["antacid", "eno", "digestion", "acidity", "gut health", "probiotics"] },
  { label: "Heart & Cholesterol",       category: "Medicine", route: "/medicines?search=cholesterol",     keywords: ["cholesterol", "statins", "atorvastatin", "heart medicine", "lipid"] },

  // ── Health Plans ─────────────────────────────────────────────────────────
  { label: "Individual Health Plan",       category: "Health Plan", route: "/plans", keywords: ["individual plan", "single", "personal plan", "self plan", "adult plan"] },
  { label: "Student Plan",                 category: "Health Plan", route: "/plans", keywords: ["student", "college plan", "coaching plan", "education plan"] },
  { label: "Family Health Plan",           category: "Health Plan", route: "/plans", keywords: ["family plan", "family cover", "family health", "joint plan"] },
  { label: "Corporate Wellness Plan",      category: "Health Plan", route: "/plans", keywords: ["corporate", "enterprise", "company health", "employee benefits", "b2b"] },
  { label: "Employee Wellness Program",    category: "Health Plan", route: "/plans", keywords: ["employee wellness", "workforce health", "hr benefits", "staff health", "workplace"] },

  // ── Common Lab Tests ─────────────────────────────────────────────────────
  { label: "NABL Accredited Labs",    category: "Lab Test", route: "/labs",                          keywords: ["nabl", "accredited", "certified lab", "iso lab", "quality lab"] },
  { label: "CBC Blood Test",          category: "Lab Test", route: "/labs?search=cbc",               keywords: ["cbc", "complete blood count", "hemoglobin", "wbc", "rbc", "platelets"] },
  { label: "Lipid Profile",           category: "Lab Test", route: "/labs?search=lipid",             keywords: ["lipid", "cholesterol", "triglycerides", "hdl", "ldl", "cardiovascular"] },
  { label: "Thyroid Test (TSH)",      category: "Lab Test", route: "/labs?search=thyroid",           keywords: ["thyroid", "tsh", "t3", "t4", "hypothyroid", "hyperthyroid"] },
  { label: "HbA1c Diabetes Test",     category: "Lab Test", route: "/labs?search=hba1c",             keywords: ["hba1c", "glycated hemoglobin", "diabetes test", "sugar test", "3 month sugar"] },
  { label: "Vitamin D3 Test",         category: "Lab Test", route: "/labs?search=vitamin+d",         keywords: ["vitamin d", "vit d", "d3", "bone", "calcium", "sunshine vitamin"] },
  { label: "Vitamin B12 Test",        category: "Lab Test", route: "/labs?search=vitamin+b12",       keywords: ["vitamin b12", "b12", "cyanocobalamin", "nerve", "anemia"] },
  { label: "Liver Function Test",     category: "Lab Test", route: "/labs?search=liver",             keywords: ["liver", "lft", "sgot", "sgpt", "bilirubin", "hepatitis", "lfts"] },
  { label: "Kidney Function Test",    category: "Lab Test", route: "/labs?search=kidney",            keywords: ["kidney", "kft", "creatinine", "urea", "uric acid", "renal"] },
  { label: "Blood Sugar (Fasting)",   category: "Lab Test", route: "/labs?search=blood+sugar",       keywords: ["blood sugar", "fasting glucose", "fbs", "glucose test", "diabetes check"] },
  { label: "Full Body Checkup",       category: "Lab Test", route: "/labs?search=full+body",         keywords: ["full body", "comprehensive", "complete health", "master checkup", "60 tests"] },
  { label: "COVID-19 Test",           category: "Lab Test", route: "/labs?search=covid",             keywords: ["covid", "corona", "pcr", "rt-pcr", "antigen", "covid test"] },
  { label: "Urine Analysis (Routine)",category: "Lab Test", route: "/labs?search=urine",             keywords: ["urine", "urine test", "uti", "routine urine", "urine culture"] },
];
