"""
Visualize GAN Comparison Report
Generates bar charts comparing No GAN vs Standard GAN vs CGAN
for both XGBoost and NGBoost models separately.
"""
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np
import os

OUTPUT_DIR = r'comparison_charts'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ===== DATA FROM REPORTS =====

# XGBoost results
xgb_data = {
    'No GAN':       {'Accuracy': 90.86, 'Precision\n(Legit)': 90.95, 'Recall\n(Legit)': 99.80, 'F1\n(Legit)': 95.17, 'Precision\n(Fraud)': 82.61, 'Recall\n(Fraud)': 8.80,  'F1\n(Fraud)': 15.90},
    'Standard GAN': {'Accuracy': 84.00, 'Precision\n(Legit)': 79.69, 'Recall\n(Legit)': 91.12, 'F1\n(Legit)': 85.03, 'Precision\n(Fraud)': 89.71, 'Recall\n(Fraud)': 76.92, 'F1\n(Fraud)': 82.82},
    'CGAN':         {'Accuracy': 87.83, 'Precision\n(Legit)': 85.43, 'Recall\n(Legit)': 91.27, 'F1\n(Legit)': 88.26, 'Precision\n(Fraud)': 90.58, 'Recall\n(Fraud)': 84.36, 'F1\n(Fraud)': 87.36},
}

# NGBoost results
ngb_data = {
    'No GAN':       {'Accuracy': 90.18, 'Precision\n(Legit)': 90.18, 'Recall\n(Legit)': 100.00, 'F1\n(Legit)': 94.84, 'Precision\n(Fraud)': 0.00,  'Recall\n(Fraud)': 0.00,  'F1\n(Fraud)': 0.00},
    'Standard GAN': {'Accuracy': 77.08, 'Precision\n(Legit)': 71.46, 'Recall\n(Legit)': 89.92,  'F1\n(Legit)': 79.64, 'Precision\n(Fraud)': 86.52, 'Recall\n(Fraud)': 64.31, 'F1\n(Fraud)': 73.78},
    'CGAN':         {'Accuracy': 80.00, 'Precision\n(Legit)': 78.30, 'Recall\n(Legit)': 83.14,  'F1\n(Legit)': 80.65, 'Precision\n(Fraud)': 81.93, 'Recall\n(Fraud)': 76.84, 'F1\n(Fraud)': 79.31},
}

# Confusion matrices [TN, FP; FN, TP]
xgb_cm = {
    'No GAN':       np.array([[1980,    4], [ 197,   19]]),
    'Standard GAN': np.array([[1817,  177], [ 463, 1543]]),
    'CGAN':         np.array([[1830,  175], [ 312, 1683]]),
}

ngb_cm = {
    'No GAN':       np.array([[1984,    0], [ 216,    0]]),
    'Standard GAN': np.array([[1793,  201], [ 716, 1290]]),
    'CGAN':         np.array([[1667,  338], [ 462, 1533]]),
}

COLORS = {'No GAN': '#ef4444', 'Standard GAN': '#f59e0b', 'CGAN': '#22c55e'}
METHODS = ['No GAN', 'Standard GAN', 'CGAN']


def plot_grouped_bar(data, title, filename):
    """Create a grouped bar chart for all metrics."""
    metrics = list(list(data.values())[0].keys())
    x = np.arange(len(metrics))
    width = 0.25

    fig, ax = plt.subplots(figsize=(14, 6))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    for i, method in enumerate(METHODS):
        values = [data[method][m] for m in metrics]
        bars = ax.bar(x + i * width, values, width, label=method,
                      color=COLORS[method], edgecolor='white', linewidth=0.5,
                      alpha=0.9, zorder=3)
        # Value labels on bars
        for bar, val in zip(bars, values):
            if val > 0:
                ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                        f'{val:.1f}%', ha='center', va='bottom', fontsize=7,
                        fontweight='bold', color='white')

    ax.set_xlabel('Metrics', fontsize=12, color='white', fontweight='bold')
    ax.set_ylabel('Score (%)', fontsize=12, color='white', fontweight='bold')
    ax.set_title(title, fontsize=16, color='white', fontweight='bold', pad=15)
    ax.set_xticks(x + width)
    ax.set_xticklabels(metrics, fontsize=9, color='#cccccc')
    ax.set_ylim(0, 115)
    ax.tick_params(colors='#cccccc')
    ax.legend(fontsize=11, loc='upper right', facecolor='#16213e', edgecolor='#444',
              labelcolor='white')
    ax.grid(axis='y', alpha=0.15, color='white', zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#444')
    ax.spines['bottom'].set_color('#444')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"Saved: {path}")


def plot_fraud_focus_single(data, model_name, filename):
    """Fraud-specific metrics comparison (the most important ones)."""
    fraud_metrics = ['Recall\n(Fraud)', 'Precision\n(Fraud)', 'F1\n(Fraud)']
    labels = ['Fraud Recall', 'Fraud Precision', 'Fraud F1-Score']

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')
    
    fig.suptitle(f'{model_name} Fraud Detection Performance',
                 fontsize=14, color='white', fontweight='bold', y=1.02)

    x = np.arange(len(labels))
    width = 0.25

    for i, method in enumerate(METHODS):
        values = [data[method][m] for m in fraud_metrics]
        bars = ax.bar(x + i * width, values, width, label=method,
                      color=COLORS[method], edgecolor='white', linewidth=0.5,
                      alpha=0.9, zorder=3)
        for bar, val in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
                    f'{val:.1f}%', ha='center', va='bottom', fontsize=8,
                    fontweight='bold', color='white')

    ax.set_xticks(x + width)
    ax.set_xticklabels(labels, fontsize=10, color='#cccccc')
    ax.set_ylim(0, 110)
    ax.set_ylabel('Score (%)', fontsize=10, color='white')
    ax.tick_params(colors='#cccccc')
    ax.grid(axis='y', alpha=0.15, color='white', zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#444')
    ax.spines['bottom'].set_color('#444')
    
    ax.legend(fontsize=10, facecolor='#16213e', edgecolor='#444', labelcolor='white')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"Saved: {path}")


def plot_accuracy_comparison_single(data, model_name, filename):
    """Simple accuracy comparison for a single model."""
    fig, ax = plt.subplots(figsize=(6, 5))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    x = np.arange(len(METHODS))
    values = [data[method]['Accuracy'] for method in METHODS]
    colors = [COLORS[m] for m in METHODS]

    bars = ax.bar(x, values, color=colors, edgecolor='white', linewidth=0.5, alpha=0.9, zorder=3)
    
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.8,
                f'{val:.1f}%', ha='center', va='bottom', fontsize=10,
                fontweight='bold', color='white')

    ax.set_title(f'{model_name} Overall Accuracy', fontsize=14, color='white',
                 fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(METHODS, fontsize=10, color='#cccccc')
    ax.set_ylabel('Accuracy (%)', fontsize=12, color='white', fontweight='bold')
    ax.set_ylim(0, 105)
    ax.tick_params(colors='#cccccc')
    
    ax.grid(axis='y', alpha=0.15, color='white', zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#444')
    ax.spines['bottom'].set_color('#444')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"Saved: {path}")


def plot_confusion_matrices_single(cms, model_name, filename):
    """Plot 1x3 grid of confusion matrix heatmaps for a single model."""
    labels = ['Legitimate', 'Fraud']

    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    fig.patch.set_facecolor('#1a1a2e')
    fig.suptitle(f'{model_name} Confusion Matrices Comparison', fontsize=18, color='white',
                 fontweight='bold', y=0.98)

    for col, method in enumerate(METHODS):
        ax = axes[col]
        cm = cms[method]
        
        # Create a custom colormap based on method color
        base_color = COLORS[method]
        cmap = mcolors.LinearSegmentedColormap.from_list(
            'custom', ['#1a1a2e', base_color], N=256)

        # Plot heatmap
        im = ax.imshow(cm, interpolation='nearest', cmap=cmap, aspect='auto')

        # Add text annotations
        max_val = cm.max()
        for i in range(2):
            for j in range(2):
                val = cm[i, j]
                text_color = 'white' if val > max_val * 0.5 else '#cccccc'
                ax.text(j, i, f'{val:,}', ha='center', va='center',
                        fontsize=16, fontweight='bold', color=text_color)

        # Title: method
        title = f'{method}'
        ax.set_title(title, fontsize=14, color=COLORS[method],
                     fontweight='bold', pad=8)

        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(labels, fontsize=10, color='#cccccc')
        ax.set_yticklabels(labels, fontsize=10, color='#cccccc')
        ax.set_xlabel('Predicted', fontsize=10, color='#aaaaaa')
        ax.set_ylabel('Actual', fontsize=10, color='#aaaaaa')
        ax.tick_params(colors='#cccccc', length=0)

        # Border color matching the method
        for spine in ax.spines.values():
            spine.set_color(COLORS[method])
            spine.set_linewidth(2)

    plt.tight_layout(rect=[0, 0, 1, 0.90])
    path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"Saved: {path}")


if __name__ == "__main__":
    print("Generating separated comparison charts...\n")

    plot_grouped_bar(xgb_data, 'XGBoost: No GAN vs Standard GAN vs CGAN', 'xgboost_all_metrics.png')
    plot_grouped_bar(ngb_data, 'NGBoost: No GAN vs Standard GAN vs CGAN', 'ngboost_all_metrics.png')
    
    # Separated specific charts
    plot_fraud_focus_single(xgb_data, 'XGBoost', 'xgboost_fraud_detection_focus.png')
    plot_fraud_focus_single(ngb_data, 'NGBoost', 'ngboost_fraud_detection_focus.png')
    
    plot_accuracy_comparison_single(xgb_data, 'XGBoost', 'xgboost_accuracy_comparison.png')
    plot_accuracy_comparison_single(ngb_data, 'NGBoost', 'ngboost_accuracy_comparison.png')
    
    plot_confusion_matrices_single(xgb_cm, 'XGBoost', 'xgboost_confusion_matrices.png')
    plot_confusion_matrices_single(ngb_cm, 'NGBoost', 'ngboost_confusion_matrices.png')

    print(f"\nAll separated charts saved to: {OUTPUT_DIR}")
