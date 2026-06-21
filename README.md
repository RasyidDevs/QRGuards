# QRGuard

QRGuard is an AI-powered web application designed to detect whether a QR Code redirects users to a phishing website or a legitimate destination.

The system allows users to scan or upload a QR Code and receive a security analysis before opening the target URL. QRGuard focuses on fast URL-based phishing detection without relying on web crawling, making it suitable for real-time QR scanning.

---

# Overview

QRGuard works by extracting the URL contained inside a QR Code and analyzing the URL using a machine learning model. The model predicts whether the extracted URL is safe or potentially dangerous.

The system is designed as a risk-warning tool. Instead of directly blocking users, QRGuard provides an early warning so users can make safer decisions before accessing suspicious links.

---

# Features

- QR Code scanning
- URL extraction from QR content
- AI-based phishing URL detection
- Real-time prediction
- Risk classification result
- Web-based access
- Lightweight URL-only analysis

---

# Methodology

QRGuard uses a hybrid phishing URL detection method adapted from a referenced phishing URL detection paper.

The method combines two types of URL information:

1. Semantic URL representation
2. Manual URL characteristics

Semantic representation is used to capture contextual patterns from the URL string, while manual features are used to capture structural indicators commonly found in phishing URLs.

This hybrid approach allows the model to analyze URLs from both semantic and lexical perspectives.

---

# Reference Method

The model architecture is based on the paper:

**A Semantic-Aware Approach to Phishing URL Detection**  
Huynh, Nguyen, and Tran, 2025  
Engineering, Technology & Applied Science Research  
DOI: https://doi.org/10.48084/etasr.13187

The referenced paper proposes a phishing URL detection model that combines BERT semantic embeddings, BiLSTM, attention mechanism, and selected handcrafted URL features.

QRGuard adapts this architecture for QR Code-based phishing detection.

---

# Dataset

The main dataset used for model training is the Phishing Site URLs dataset.

The dataset contains URL samples labeled as:

~~~text
0 = Legitimate
1 = Phishing
~~~

The model is also evaluated using external URL datasets to test its ability to generalize on URLs outside the training dataset.

---

# Detection Pipeline

~~~text
QR Code
   |
   v
Decode QR Content
   |
   v
Extract URL
   |
   v
URL Preprocessing
   |
   v
Feature Extraction
   |
   |-- Semantic Feature Extraction
   |   |-- BERT-based encoder
   |   |-- 768-dimensional URL embedding
   |
   |-- Manual Feature Extraction
       |-- URL length
       |-- Digit count
       |-- Special character count
       |-- Path length
       |-- Query existence
       |-- Fragment existence
       |-- URL entropy
   |
   v
BiLSTM Layer
   |
   v
Attention Layer
   |
   v
Feature Fusion
   |
   v
Fully Connected Classification Layer
   |
   v
Prediction Result
SAFE / DANGEROUS
~~~

---

# Main Model Architecture

QRGuard uses two main feature branches before producing the final prediction.

## 1. Semantic Feature Extraction

The URL is transformed into a semantic vector using a pretrained BERT-based SentenceTransformer model.

Each URL is converted into a 768-dimensional embedding vector. This representation helps the model capture hidden patterns in URL strings, including suspicious token combinations, unusual structures, and semantic relationships between URL components.

This branch is useful because phishing URLs often contain manipulated words, misleading domain names, random tokens, or suspicious path structures.

## 2. Manual Feature Extraction

In addition to semantic features, QRGuard extracts manually engineered features from the URL.

These features represent structural and lexical properties of a URL, such as:

- URL length
- Number of dots
- Number of digits
- Number of special characters
- Number of hyphens
- Number of slashes
- Number of question marks
- Number of equal symbols
- Number of at symbols
- Number of percent symbols
- Path length
- Query existence
- Fragment existence
- URL entropy

These features are important because phishing URLs often have abnormal structures, excessive symbols, long paths, random characters, and high entropy.

## 3. BiLSTM Layer

The semantic embedding is passed into a BiLSTM layer.

BiLSTM is used to learn bidirectional patterns from the URL representation. It allows the model to capture relationships from both forward and backward directions, helping the system understand URL patterns more effectively.

## 4. Attention Layer

After the BiLSTM layer, an attention mechanism is applied.

The attention layer helps the model focus on the most important parts of the learned URL representation. This improves the model's ability to identify suspicious patterns that contribute strongly to phishing detection.

## 5. Feature Fusion

The output from the attention layer is combined with the output from the manual feature branch.

This fusion allows the model to use both semantic information and structural URL characteristics before making the final prediction.

## 6. Classification

The combined feature representation is passed into a fully connected neural network layer.

The model produces a binary classification result:

~~~text
SAFE      = Legitimate URL
DANGEROUS = Phishing URL
~~~

---

# Manual Features Used

The model extracts 20 manual URL features:

| Feature | Description |
|---|---|
| url_length | Total length of the URL |
| number_of_dots_in_url | Number of dot characters in the URL |
| having_repeated_digits_in_url | Whether the URL contains repeated digits |
| number_of_digits_in_url | Total number of digits in the URL |
| number_of_special_char_in_url | Total number of selected special characters |
| number_of_hyphens_in_url | Number of hyphen characters |
| number_of_underline_in_url | Number of underscore characters |
| number_of_slash_in_url | Number of slash characters |
| number_of_questionmark_in_url | Number of question mark characters |
| number_of_equal_in_url | Number of equal symbols |
| number_of_at_in_url | Number of at symbols |
| number_of_dollar_in_url | Number of dollar symbols |
| number_of_exclamation_in_url | Number of exclamation symbols |
| number_of_hashtag_in_url | Number of hashtag symbols |
| number_of_percent_in_url | Number of percent symbols |
| path_length | Length of URL path |
| having_query | Whether the URL contains query parameters |
| having_fragment | Whether the URL contains a fragment |
| having_anchor | Whether the URL contains an anchor |
| entropy_of_url | Shannon entropy score of the URL |

---

# Model Performance

The model was evaluated on both validation data and external test data.

## Validation Result

The validation result represents performance on data from the same distribution as the training dataset.

| Metric | Value |
|---|---:|
| Validation Accuracy | 97.98% |
| Validation Precision | 96.47% |
| Validation Recall | 96.43% |
| Validation F1-score | 96.45% |

The validation result shows that the model performs strongly when evaluated on data with a similar distribution to the training dataset.

## External Test Result

The external test result represents performance on unseen URL datasets with different distributions.

| Metric | Value |
|---|---:|
| Accuracy | 87.72% |
| Precision | 77.99% |
| Recall | 85.06% |
| F1-score | 81.37% |

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Django / FastAPI |
| AI Model | BERT + BiLSTM + Attention |
| Feature Engineering | Python, Pandas, Scikit-learn |
| Deep Learning | PyTorch |
| Database | PostgreSQL |
| Deployment | Vercel / Backend Server |

---

# Installation

Clone the repository:

~~~bash
git clone https://github.com/your-username/QRGuard.git
~~~

Install dependencies:

~~~bash
npm install
~~~

Run the project:

~~~bash
npm start
~~~

Open the application:

~~~text
http://localhost:3000
~~~

---

# Team

Hackathon Team - QRGuard

---

# License

MIT License
