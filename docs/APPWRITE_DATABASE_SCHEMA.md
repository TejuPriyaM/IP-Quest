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
- score: Integer
- total_questions: Integer
- completed_at: Datetime

## Table: progress

Purpose: Store topic-specific learning progress.

Fields:
- user_id: Varchar
- topic_id: Varchar
- completion_percentage: Integer
- best_score: Integer
- last_accessed_at: Datetime