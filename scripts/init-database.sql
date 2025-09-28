-- Initial database setup script
-- Creates the core tables required by the application

CREATE TABLE IF NOT EXISTS libraries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    opening_hours VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_libraries_name ON libraries(name);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) NOT NULL DEFAULT '0000000000',
    available BOOLEAN NOT NULL DEFAULT true,
    library_id INTEGER NULL REFERENCES libraries(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_library_id ON books(library_id);

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL DEFAULT '0000000000',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

ALTER TABLE members
    DROP COLUMN IF EXISTS password_hash;

CREATE TABLE IF NOT EXISTS auth_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email);

INSERT INTO members (name, email)
VALUES ('Administrador', 'admin@whereisthelibrary.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO auth_accounts (email, password_hash)
VALUES (
    'admin@whereisthelibrary.com',
    'pbkdf2:sha512:310000:21f84c4d4a1452b39f03b120628c0414:10a36045594c922f97cdaa55018843c186b29389c0c54401b1e4fc7cbb98ac8fec6efeccb1ee5c12da74561fa9e38a8782a26044c53d1cb62b7f034c8f8ee842'
)
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    loan_date TIMESTAMP NOT NULL DEFAULT NOW(),
    return_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_loan_date ON loans(loan_date);
CREATE INDEX IF NOT EXISTS idx_loans_return_date ON loans(return_date);
CREATE INDEX IF NOT EXISTS idx_loans_book_return ON loans(book_id, return_date);
