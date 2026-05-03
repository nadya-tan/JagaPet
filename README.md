# Shell & Fin MY

## About the Project

**Shell & Fin MY** is an aquatic pet care, identification, and responsible ownership web application developed by **TM10 - Miaowww** for the **FIT5120 Industry Experience Studio Project**.

The project is designed to support current and prospective fish and turtle owners in Malaysia. It helps users identify aquatic pets, understand possible visible health concerns, access care guidance, manage their pets, and learn about responsible aquatic pet ownership.

Shell & Fin MY focuses on making aquatic pet information easier to understand for non-expert users. It combines species data, AI-supported image analysis, recommendation logic, user profile features, and educational content to help users make more informed decisions.

Live Website:  
https://shell-and-fin.vercel.app/

GitHub Repository:  
https://github.com/nadya-tan/JagaPet

---

## Project Goal

Many aquatic pet owners may not know the exact species of their fish or turtle, how to care for them properly, or whether visible symptoms may indicate a possible health concern. Some users may also be unaware of the environmental risks of releasing unwanted pets into the wild.

Shell & Fin MY aims to support responsible aquatic pet ownership by helping users:

- Identify fish and turtle species from uploaded images
- Receive early AI-supported visible health screening guidance
- Access species-specific care information
- Save and manage pet profiles
- Track routine pet care tasks
- Learn about biodiversity risks and responsible rehoming
- Discover beginner-friendly aquatic pets
- Make more informed decisions before and after owning aquatic pets

---

## Key Features

### 1. Identify Pet by Image

Users can upload an image of a fish or turtle to receive a likely species identification result. The system helps users who may not know the exact species of their aquatic pet.

The result may include:

- Common name
- Scientific name
- Species category
- Brief species information
- Link to a relevant species profile, where available

This feature is intended to help users begin learning more about their pet and access more relevant care information.

---

### 2. AI Health Screening

Shell & Fin MY includes an AI-supported health screening feature where users can upload a pet image to check for possible visible health concerns.

The health screening feature is designed to:

- Accept valid pet image uploads
- Display a preview of the uploaded image
- Provide a possible visible health concern result
- Remind users that the result is an early AI screening only
- Encourage users to use the result as guidance, not as a final diagnosis
- Guide users toward further care information

> **Important:** The health screening feature does not replace professional veterinary advice. It is only intended to provide early awareness based on visible signs.

---

### 3. Species Search

Users can search for aquatic species using common names and access relevant species information. This feature supports users who already know the name of a fish or turtle and want to learn more about it quickly.

---

### 4. Species Profile

Each species profile provides a general overview of a species. This helps users understand basic information before choosing or caring for an aquatic pet.

Species profiles may include:

- Common name
- Scientific name
- Risk level
- Safety summary
- Estimated price
- Notes
- Quick facts
- Comparison support

---

### 5. Care Guide

The Care Guide provides more detailed care-related information for aquatic pet owners. It is separated from the Species Profile because users may need deeper guidance after identifying or selecting a pet.

The Care Guide may include:

- Basic care information
- Habitat requirements
- Water parameters
- Feeding guidance
- Maintenance routines
- Tank setup requirements
- Health monitoring
- Common illness awareness
- Emergency care notice

---

### 6. User Profile and My Pets

Users can manage their pet information through the Profile page. This supports long-term aquatic pet ownership by allowing users to save and view their pets.

The profile-related features include:

- Viewing user profile information
- Accessing the “My Pets” section
- Adding pets to the profile
- Managing saved pet information
- Viewing care-related tasks

---

### 7. Pet Care Tasks

Shell & Fin MY supports routine pet care through pet care task tracking. This helps users remember regular responsibilities involved in aquatic pet ownership.

Examples of care tasks include:

- Feeding
- Water change
- Health check
- General maintenance reminders

Users can view tasks and mark them as completed.

---

### 8. Compatibility Quiz

The Compatibility Quiz helps prospective owners receive pet recommendations based on their lifestyle and preferences.

This feature supports users who are unsure which aquatic pet may be more suitable for them. It was developed in an earlier iteration and remains part of the current system.

---

### 9. Beginner Recommendations

The website includes beginner-friendly recommendations for users who are new to aquatic pet ownership. This helps users explore pets that may be easier to care for and more suitable for beginners.

---

### 10. Responsible Ownership Awareness

Shell & Fin MY includes educational content about responsible aquatic pet ownership, including the risks of releasing pets into the wild.

This includes:

- High biodiversity risk information
- Responsible ownership messages
- Educational video content
- Awareness of ecological impact
- Need to Rehome guidance

This feature supports the project’s broader goal of reducing harmful pet release and encouraging safer choices.

---

### 11. Need to Rehome

The Need to Rehome section helps users consider responsible options when they can no longer care for their aquatic pets. This supports the project’s focus on preventing harmful release into local environments.

---

## Technology Stack

| Area                 | Technologies                 |
| -------------------- | ---------------------------- |
| Frontend             | React, TypeScript, HTML, CSS |
| Build Tool           | Vite                         |
| UI / Design          | Figma, CSS                   |
| Deployment           | Vercel                       |
| Version Control      | Git, GitHub                  |
| Database             | Neon PostgreSQL              |
| Backend / API Logic  | Python, Flask                |
| Recommendation Logic | Custom KNN Variant           |
| API Hosting          | PythonAnywhere               |
| AI Image Analysis    | Gemini API                   |
| Data Processing      | Python, NumPy                |

---

## System Overview

Shell & Fin MY is built as a connected web application with multiple main components:

### Frontend Web Application

The frontend is built using React, TypeScript, HTML, CSS, and Vite. It provides the user interface for the homepage, species search, image upload, health screening, pet profiles, care guides, compatibility quiz, and user profile features.

### Database Layer

The project uses Neon PostgreSQL as the relational database layer. It stores structured data such as user information, pet profiles, species data, care tasks, quiz profiles, and related project information.

### AI Identification and Health Screening

The website uses AI-supported image analysis to support aquatic species identification and visible health screening. These features allow users to upload pet images and receive useful results or clear error messages when the service is unavailable.

### Recommendation Logic

The project includes recommendation logic to support pet suitability and species comparison. This helps users explore aquatic pets based on relevant characteristics and user needs.

### Deployment

The live website is deployed through Vercel, allowing users to access the application online.

---

## Project Structure

```text
Webpage front-end code
├── api/              # Backend service logic and API-related files
├── guidelines/       # Reference documentation and project guidelines
├── public/           # Static assets such as images
├── src/              # Core frontend application code
│   ├── app/          # Main application logic and routes
│   ├── imports/      # Shared modules and components
│   └── styles/       # Global and component-level styling files
└── other             # Documentation, version control, and supporting files

# Shell & Fin MY Platform Design

This is a code bundle for Shell & Fin MY Platform Design. The design prototype is available at https://www.figma.com/design/mhKvUgPkGn5X1N4DgvQqQZ/JagaPet-Platform-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.
```
