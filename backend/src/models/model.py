"""
model.py - Definisi arsitektur model PhishingBiLSTMAttention untuk QRGuards.

Arsitektur hybrid yang menggabungkan:
1. BiLSTM + Attention untuk memproses BERT embedding (768-dim)
2. Dense layer untuk memproses manual URL features (20-dim)
3. Fusion layer yang menggabungkan kedua output → Sigmoid classifier

Semua class dan parameter di-copy exact dari notebook QRGuards.ipynb.
"""

import torch
import torch.nn as nn


class AttentionLayer(nn.Module):
    """
    Attention Layer untuk memberi bobot pada output BiLSTM.

    Exact copy dari notebook:
    - W: Linear(hidden_dim, hidden_dim)
    - v: Linear(hidden_dim, 1, bias=False)
    - Score = v(tanh(W(lstm_output)))
    - Weights = softmax(score, dim=1)
    - Context = sum(weights * lstm_output, dim=1)
    """

    def __init__(self, hidden_dim):
        super().__init__()

        self.W = nn.Linear(hidden_dim, hidden_dim)
        self.v = nn.Linear(hidden_dim, 1, bias=False)

    def forward(self, lstm_output):

        score = self.v(torch.tanh(self.W(lstm_output)))

        weights = torch.softmax(score, dim=1)

        context = torch.sum(weights * lstm_output, dim=1)

        return context


class PhishingBiLSTMAttention(nn.Module):
    """
    Hybrid model: BiLSTM-Attention + Manual Features untuk deteksi phishing.

    Exact copy dari notebook:
    - BERT branch: BiLSTM(768 → 256, bidirectional) → Attention → context (512-dim)
    - Manual branch: Linear(20 → 64) → ReLU → Dropout(0.1) → manual_out (64-dim)
    - Fusion: concat(context, manual_out) → Linear(576 → 1) → Sigmoid
    """

    def __init__(self, bert_dim=768, manual_dim=20, lstm_hidden=256):
        super().__init__()

        self.bilstm = nn.LSTM(
            input_size=bert_dim,
            hidden_size=lstm_hidden,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )

        self.attention = AttentionLayer(hidden_dim=lstm_hidden * 2)

        self.manual_dense = nn.Sequential(
            nn.Linear(manual_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.1)
        )

        self.classifier = nn.Sequential(
            nn.Linear((lstm_hidden * 2) + 64, 1),
            nn.Sigmoid()
        )

    def forward(self, bert_x, manual_x):
        lstm_out, _ = self.bilstm(bert_x)

        context = self.attention(lstm_out)

        manual_out = self.manual_dense(manual_x)

        combined = torch.cat([context, manual_out], dim=1)

        output = self.classifier(combined)

        return output.squeeze(1)
