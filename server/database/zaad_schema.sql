USE zaaddb;
GO

-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
GO


USE zaaddb;
GO

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email = LOWER(email)),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    bio VARCHAR(MAX),
    profile_picture_url VARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@__%.__%')
);

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(MAX),
    parent_category_id INT NULL,
    CONSTRAINT fk_parent_category FOREIGN KEY (parent_category_id) 
        REFERENCES categories(category_id) ON DELETE NO ACTION,
    CONSTRAINT chk_name_length CHECK (LEN(name) >= 3),
    CONSTRAINT chk_parent_category CHECK (parent_category_id IS NULL OR parent_category_id <> category_id)
);

CREATE TABLE courses (
    course_id INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255) NOT NULL CHECK (LEN(title) >= 5 AND LEN(title) <= 255),
    description VARCHAR(MAX) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language VARCHAR(50) NOT NULL,
    category_id INT,
    instructor_id INT NOT NULL,
    thumbnail_url VARCHAR(255),
    promo_video_url VARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_title_length CHECK (LEN(title) >= 5)
);

CREATE TABLE modules (
    module_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (LEN(title) >= 5),
    position INT NOT NULL CHECK (position >= 1),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_module_position UNIQUE (course_id, position)
);

CREATE TABLE lessons (
    lesson_id INT IDENTITY(1,1) PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (LEN(title) >= 5),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'article', 'quiz')),
    content_url VARCHAR(255) NOT NULL,
    duration INT CHECK (duration >= 0),
    position INT NOT NULL CHECK (position >= 1),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_lesson_position UNIQUE (module_id, position)
);

CREATE TABLE assignments (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (LEN(title) >= 5),
    description VARCHAR(MAX) NOT NULL,
    due_date DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);

CREATE TABLE assignment_submissions (
    submission_id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text VARCHAR(MAX),
    submission_file_url VARCHAR(255),
    submitted_at DATETIME2 DEFAULT GETDATE(),
    grade DECIMAL(5, 2) CHECK (grade >= 0 AND grade <= 100),
    feedback VARCHAR(MAX),
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION
);

CREATE TABLE exams (
    exam_id INT IDENTITY(1,1) PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (LEN(title) >= 5),
    description VARCHAR(MAX) NOT NULL,
    exam_date DATETIME2 NOT NULL,
    duration INT CHECK (duration > 0),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);

CREATE TABLE exam_results (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    graded_at DATETIME2 DEFAULT GETDATE(),
    feedback VARCHAR(MAX),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION
);

CREATE TABLE enrollments (
    enrollment_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at DATETIME2 DEFAULT GETDATE(),
    progress DECIMAL(5, 2) DEFAULT 0.0 CHECK (progress >= 0.0 AND progress <= 100.0),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_enrollment UNIQUE (student_id, course_id)
);

CREATE TABLE reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    rating DECIMAL(2, 1) CHECK (rating >= 1.0 AND rating <= 5.0),
    comment VARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    CONSTRAINT chk_unique_review UNIQUE (course_id, student_id)
);

CREATE TABLE payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'stripe')),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_id VARCHAR(255) UNIQUE,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_status CHECK (status = 'completed' AND transaction_id IS NOT NULL OR status != 'completed')
);

CREATE TABLE coupons (
    coupon_id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    valid_from DATETIME2 NOT NULL CHECK (valid_from >= GETDATE()),
    valid_until DATETIME2 NOT NULL,
    max_redemptions INT NOT NULL CHECK (max_redemptions > 0),
    current_redemptions INT DEFAULT 0 CHECK (current_redemptions >= 0),
    course_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE NO ACTION,
    CONSTRAINT chk_coupon_dates CHECK (valid_until > valid_from)
);

CREATE TABLE wishlists (
    wishlist_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_wishlist UNIQUE (student_id, course_id)
);

CREATE TABLE certificates (
    certificate_id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_url VARCHAR(255) NOT NULL UNIQUE,
    issued_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE NO ACTION
);

CREATE TABLE announcements (
    announcement_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    CONSTRAINT chk_announcement_title_length CHECK (LEN(title) >= 5)
);

CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE messages (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    course_id INT NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    sent_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE NO ACTION,
    CONSTRAINT chk_message_length CHECK (LEN(content) >= 1),
    CONSTRAINT chk_different_users CHECK (sender_id <> receiver_id)
);

CREATE TABLE user_activity (
    activity_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'view_course', 'start_lesson', 'complete_lesson', 'post_review')),
    course_id INT,
    lesson_id INT,
    activity_timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE NO ACTION,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE NO ACTION
);

CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
);

CREATE TABLE questions (
    question_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    lesson_id INT,
    student_id INT NOT NULL,
    question_text VARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE NO ACTION,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    CONSTRAINT chk_question_text_length CHECK (LEN(question_text) >= 5)
);

CREATE TABLE answers (
    answer_id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    instructor_id INT NOT NULL,
    answer_text VARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    CONSTRAINT chk_answer_text_length CHECK (LEN(answer_text) >= 5)
);

