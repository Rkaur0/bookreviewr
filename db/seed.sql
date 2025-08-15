DELETE FROM BookTags;
DELETE FROM Tags;
DELETE FROM Reviews;
DELETE FROM Books;
DELETE FROM Users;

INSERT INTO Users (name, email, password_hash, role, created_at) VALUES
('Alice Johnson', 'alice@example.com', '$2b$10$QpiXY0eTjq.9FjLZcO4YvO4p1Gj1Rk9m8f8v3JwA4u8.7I9s3e8xu', 'user', CURRENT_TIMESTAMP),
('Bob Smith', 'bob@example.com', '$2b$10$QpiXY0eTjq.9FjLZcO4YvO4p1Gj1Rk9m8f8v3JwA4u8.7I9s3e8xu', 'user', CURRENT_TIMESTAMP);

INSERT INTO Books (title, author, isbn, avg_rating, cover_url, created_at) VALUES
('Pride and Prejudice', 'Jane Austen', '9780141439518', NULL, 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', CURRENT_TIMESTAMP),
('Moby-Dick', 'Herman Melville', '9780142437247', NULL, 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg', CURRENT_TIMESTAMP),
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', NULL, 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', CURRENT_TIMESTAMP),
('1984', 'George Orwell', '9780451524935', NULL, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', CURRENT_TIMESTAMP),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', NULL, 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', CURRENT_TIMESTAMP);

INSERT INTO Tags (name) VALUES
('Classic'), ('Science Fiction'), ('Romance'), ('Mystery'), ('Young Adult'), ('Drama');

INSERT INTO BookTags (book_id, tag_id) VALUES
(1,1),(1,3),(2,1),(3,1),(3,6),(4,1),(4,2),(5,1),(5,6);

INSERT INTO Reviews (user_id, book_id, rating, title, body, contains_spoilers, created_at, updated_at) VALUES
(1, 1, 5, 'A timeless romance', 'One of the most beautifully written love stories ever.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
