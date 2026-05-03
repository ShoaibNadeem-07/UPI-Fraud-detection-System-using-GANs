import matplotlib.pyplot as plt
import numpy as np
import os

OUTPUT_DIR = r"C:\Users\shoai\.gemini\antigravity\brain\ca4acddc-9549-4820-9921-e07532a9c18e"

def plot_epochs_tradeoff():
    # LINE CHART WITH FILLED AREAS
    epochs = np.linspace(0, 3000, 300)
    quality = np.zeros_like(epochs)
    for i, e in enumerate(epochs):
        if e < 1500:
            quality[i] = (1 - np.exp(-e/400)) * 100
        else:
            quality[i] = 100 - (e - 1500)/15 * 0.5
            
    plt.figure(figsize=(10, 5))
    plt.plot(epochs, quality, linewidth=3, color='royalblue')
    plt.fill_between(epochs, quality, alpha=0.3, color='royalblue')
    plt.axvline(x=1500, color='green', linestyle='--', linewidth=2, label='Sweet Spot (1500 Epochs)')
    
    plt.text(500, 40, 'Underfitting\n(Poor Quality)', ha='center', color='red', fontsize=10, weight='bold')
    plt.text(1500, 105, 'Optimal', ha='center', color='green', fontsize=10, weight='bold')
    plt.text(2500, 60, 'Mode Collapse\n(Loss of Diversity)', ha='center', color='orange', fontsize=10, weight='bold')
    
    plt.title('[Line Chart] Impact of Epochs on Generated Data Quality')
    plt.xlabel('Number of Epochs')
    plt.ylabel('Conceptual Data Quality Score')
    plt.legend(loc='lower left')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'epochs_tradeoff.png'), dpi=150)
    plt.close()

def plot_batch_size_tradeoff():
    # VERTICAL BAR CHART
    batch_sizes = ['8', '16', '32', '64', '128', '256', '512']
    stability = [20, 40, 70, 95, 85, 60, 40] 
    
    colors = ['salmon', 'salmon', 'lightgreen', 'forestgreen', 'lightgreen', 'orange', 'orange']
    
    plt.figure(figsize=(10, 5))
    bars = plt.bar(batch_sizes, stability, color=colors, edgecolor='black')
    
    # Add values on top of bars
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 2, f'{yval}%', ha='center', va='bottom', weight='bold')
        
    plt.text(3, 105, 'Sweet Spot', ha='center', color='forestgreen', weight='bold')
    
    plt.title('[Bar Chart] Batch Size vs. Training Stability')
    plt.xlabel('Batch Size')
    plt.ylabel('Training Stability Score (%)')
    plt.ylim(0, 115)
    
    # Custom legend
    import matplotlib.patches as mpatches
    red_patch = mpatches.Patch(color='salmon', label='Too Noisy')
    green_patch = mpatches.Patch(color='forestgreen', label='Optimal Variance')
    orange_patch = mpatches.Patch(color='orange', label='Too Smooth (Stalls)')
    plt.legend(handles=[red_patch, green_patch, orange_patch], loc='upper left')
    
    plt.grid(axis='y', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'batch_size_tradeoff.png'), dpi=150)
    plt.close()

def plot_learning_rate_tradeoff():
    # HORIZONTAL BAR CHART
    lrs = ['0.1 (High)', '0.01', '0.001', '0.0002 (Optimal)', '0.00001 (Low)']
    success_rate = [5, 20, 60, 95, 30]
    
    colors = ['red', 'orange', 'lightgreen', 'forestgreen', 'salmon']
    
    plt.figure(figsize=(10, 5))
    bars = plt.barh(lrs, success_rate, color=colors, edgecolor='black')
    
    for bar in bars:
        xval = bar.get_width()
        plt.text(xval + 2, bar.get_y() + bar.get_height()/2, f'{xval}%', va='center', weight='bold')
        
    plt.title('[Horizontal Bar] Likelihood of GAN Convergence by Learning Rate')
    plt.xlabel('Convergence Likelihood (%)')
    plt.ylabel('Adam Learning Rate')
    plt.xlim(0, 110)
    
    plt.grid(axis='x', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'lr_tradeoff.png'), dpi=150)
    plt.close()

def plot_capacity_tradeoff():
    # SCATTER PLOT WITH BUBBLES
    nodes_gen = [32, 128, 256, 1024, 4096]
    nodes_disc = [16, 64, 128, 512, 2048]
    
    # x axis represents the capacity index
    x = [1, 2, 3, 4, 5]
    labels = ['32-16\n(Underfit)', '128-64', '256-128\n(Sweet Spot)', '1024-512', '4096-2048\n(Overfit/Memorize)']
    generalization = [30, 80, 95, 60, 20]
    
    # Bubble sizes proportional to generalization
    sizes = [g * 15 for g in generalization]
    colors = ['red', 'lightgreen', 'forestgreen', 'orange', 'red']
    
    plt.figure(figsize=(10, 5))
    plt.scatter(x, generalization, s=sizes, c=colors, alpha=0.7, edgecolors='black', linewidth=2)
    
    plt.plot(x, generalization, color='gray', linestyle='--', zorder=0)
    
    plt.xticks(x, labels)
    plt.title('[Bubble Chart] Impact of Dense Layer Capacity')
    plt.xlabel('Network Architecture Capacity (Gen-Disc Neurons)')
    plt.ylabel('Generalization Quality Score')
    plt.ylim(0, 120)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'capacity_tradeoff.png'), dpi=150)
    plt.close()

def plot_alpha_tradeoff():
    # MULTI-LINE PLOT COMPARING FUNCTION SHAPES
    x = np.linspace(-10, 10, 100)
    
    y_relu = np.maximum(0, x)
    y_leaky = np.where(x > 0, x, x * 0.2)
    y_linear = x
    
    plt.figure(figsize=(10, 5))
    
    plt.plot(x, y_relu, label='Alpha = 0.0 (Standard ReLU) - Neurons Die', linestyle='--', color='red', linewidth=2)
    plt.plot(x, y_leaky, label='Alpha = 0.2 (LeakyReLU) - Sweet Spot', color='forestgreen', linewidth=4)
    plt.plot(x, y_linear, label='Alpha = 1.0 (Linear) - Purely Linear, Fails', linestyle=':', color='orange', linewidth=2)
    
    # Highlight the negative region where the magic happens
    plt.axvspan(-10, 0, alpha=0.1, color='gray', label='Important Negative Input Range')
    
    plt.title('[Multi-Line Chart] Activation Function Behavior Based on Alpha')
    plt.xlabel('Input Value before Activation')
    plt.ylabel('Output Value')
    plt.legend(loc='upper left')
    plt.grid(True, linestyle='-', alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'alpha_tradeoff.png'), dpi=150)
    plt.close()

if __name__ == "__main__":
    plot_epochs_tradeoff()
    plot_batch_size_tradeoff()
    plot_learning_rate_tradeoff()
    plot_capacity_tradeoff()
    plot_alpha_tradeoff()
    print("Diverse tradeoff charts generated successfully.")
