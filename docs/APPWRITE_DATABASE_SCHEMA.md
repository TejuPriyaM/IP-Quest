# Appwrite Database Schema

## Database

Name: IP Quest Database

ID: TO_BE_CONFIGURED

## Table: profiles

Purpose: Store application-specific user profile data.

Fields:
- user_id: Varchar
- display_name: Varchar
- role: Varchar
- grade_level: Integer
- total_points: Integer
- created_at: Datetime

## Table: topics

Purpose: Store learning topics.

Fields:
- title: Varchar
- slug: Varchar
- description: Text
- icon: Varchar
- difficulty: Varchar
- is_published: Boolean

## Table: lessons

Purpose: Store educational lessons.

Fields:
- topic_id: Varchar
- title: Varchar
- content: Text
- estimated_minutes: Integer
- order_index: Integer
- is_published: Boolean

## Table: questions

Purpose: Store quiz questions.

Fields:
- topic_id: Varchar
- lesson_id: Varchar (optional for Learn Level questions; required for lesson assessment questions, references lessons.$id)
- question_text: Text
- options: JSON
- correct_option: Varchar
- explanation: Text
- difficulty: Varchar
- is_published: Boolean

## Table: quiz_attempts

Purpose: Store completed quiz attempts.

Fields:
- user_id: Varchar
- topic_id: Varchar
- lesson_id: Varchar (optional; references lessons.$id for teacher lesson assessments)
- level: Integer (optional; set for Level Quiz attempts)
- score: Integer
- total_questions: Integer
- completed_at: Datetime
- status: Varchar (optional; Level Quiz attempt status)
- passed: Boolean (optional; Level Quiz result)
- responses: Text (optional; saved Level Quiz answers and randomized presentation)

## Table: progress

Purpose: Store topic-specific learning progress.

Fields:
- user_id: Varchar
- topic_id: Varchar
- completion_percentage: Integer
- best_score: Integer
- last_accessed_at: Datetime

## Table: achievements

Purpose: Store the published achievement goal catalog read by the student dashboard.

Fields:
- name: Varchar
- description: Text
- icon: Varchar
- xp_reward: Integer
- requirement_type: Varchar
- requirement_value: Integer
- is_active: Boolean

This catalog is not a record of which student earned an achievement. The current schema has no student-to-achievement relation.

## Student dashboard data coverage

- The dashboard uses the authenticated Appwrite account ID to read its `profiles`, `progress`, and `quiz_attempts` records. Quiz attempt scores include topic quizzes, levels, teacher quizzes, and lesson assessments.
- `progress` stores topic-level aggregate values; it does not identify completed lessons. Lesson reading completion is not currently stored.
- Standalone game session scores/progress do not have a student-linked database table. Some game state is stored in browser-local storage and is not an authenticated student record.
- No student-earned-achievement records are available from the current schema. The dashboard must not infer earned awards from the active achievement goal catalog.