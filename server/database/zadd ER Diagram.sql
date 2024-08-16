-- Drop the database by closing existing connections
USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'zaad')
BEGIN
    ALTER DATABASE zaad SET OFFLINE WITH ROLLBACK IMMEDIATE;
    DROP DATABASE zaad;
END
GO

-- Create the database again
CREATE DATABASE zaad;
GO

-- Use the newly created database
USE zaad;
GO


-- Reviews Table
CREATE TABLE reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    rating DECIMAL(2, 1) CHECK (rating >= 1.0 AND rating <= 5.0),
    comment VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_review UNIQUE (course_id, student_id)
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'stripe')),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_id VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_status CHECK (status = 'completed' AND transaction_id IS NOT NULL OR status != 'completed')
);

-- Coupons Table
CREATE TABLE coupons (
    coupon_id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    valid_from DATETIME NOT NULL CHECK (valid_from >= GETDATE()),
    valid_until DATETIME NOT NULL,
    max_redemptions INT NOT NULL CHECK (max_redemptions > 0),
    current_redemptions INT DEFAULT 0 CHECK (current_redemptions >= 0),
    course_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_coupon_dates CHECK (valid_until > valid_from)
);

-- Wishlists Table
CREATE TABLE wishlists (
    wishlist_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_unique_wishlist UNIQUE (student_id, course_id)
);

-- Certificates Table
CREATE TABLE certificates (
    certificate_id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    certificate_url VARCHAR(255) NOT NULL UNIQUE,
    issued_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE announcements (
    announcement_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_announcement_title_length CHECK (LEN(title) >= 5)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE messages (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    course_id INT NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    sent_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_message_length CHECK (LEN(content) >= 1),
    CONSTRAINT chk_different_users CHECK (sender_id <> receiver_id)
);

-- User Activity Log Table
CREATE TABLE user_activity (
    activity_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'view_course', 'start_lesson', 'complete_lesson', 'post_review')),
    course_id INT,
    lesson_id INT,
    activity_timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
);

-- Questions Table
CREATE TABLE questions (
    question_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    lesson_id INT,
    student_id INT NOT NULL,
    question_text VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_question_text_length CHECK (LEN(question_text) >= 5)
);

-- Answers Table
CREATE TABLE answers (
    answer_id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    instructor_id INT NOT NULL,
    answer_text VARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_answer_text_length CHECK (LEN(answer_text) >= 5)
);