/**
 * Recommendation Engine Service
 * Calculates product similarity with rule-based weights.
 * Uses in-memory scoring only and does not persist recommendation data.
 */

class RecommendationEngine {
  /**
   * Get recommendations based on multiple comparison products
   * @param {Array} comparisonProducts - Products currently in comparison
   * @param {Array} allProducts - All available products
   * @param {Number} limit - Number of recommendations to return
   * @returns {Array} Top recommended products
   */
  getRecommendations(comparisonProducts, allProducts, limit = 4) {
    const comparedIds = comparisonProducts.map(p => p.id);
    const candidates = allProducts.filter(p => !comparedIds.includes(p.id));

    if (candidates.length === 0) return [];

    const scoredProducts = candidates.map(candidate => {
      let totalScore = 0;
      const maxScorePerReference = 14; // 5 + 3 + 2 + 2 + 1 + 1

      comparisonProducts.forEach(referenceProduct => {
        totalScore += this.calculateRuleScore(referenceProduct, candidate);
      });

      const averageScore = totalScore / comparisonProducts.length;
      const similarityScore = Math.round((averageScore / maxScorePerReference) * 100);

      return {
        ...candidate,
        similarityScore: similarityScore,
        scoreDetails: this.buildScoreDetails(comparisonProducts, candidate)
      };
    });

    return scoredProducts
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  /**
   * Calculate score between two products using exact rule weights.
   */
  calculateRuleScore(referenceProduct, candidateProduct) {
    let score = 0;

    if (referenceProduct.categoryId === candidateProduct.categoryId) score += 5;
    if (this.normalizeString(referenceProduct.brand) === this.normalizeString(candidateProduct.brand)) score += 3;
    if (this.materialsMatch(referenceProduct.material, candidateProduct.material)) score += 2;
    if (this.priceWithinThreshold(referenceProduct.price, candidateProduct.price)) score += 2;
    if (this.colorsMatch(referenceProduct.color, candidateProduct.color)) score += 1;
    if (this.sizesOverlap(referenceProduct.sizes, candidateProduct.sizes)) score += 1;

    return score;
  }

  /**
   * Build a lightweight details object for debugging or UI use.
   */
  buildScoreDetails(comparisonProducts, candidateProduct) {
    return comparisonProducts.map(referenceProduct => ({
      productId: referenceProduct.id,
      category: referenceProduct.categoryId === candidateProduct.categoryId,
      brand: this.normalizeString(referenceProduct.brand) === this.normalizeString(candidateProduct.brand),
      material: this.materialsMatch(referenceProduct.material, candidateProduct.material),
      price: this.priceWithinThreshold(referenceProduct.price, candidateProduct.price),
      color: this.colorsMatch(referenceProduct.color, candidateProduct.color),
      sizes: this.sizesOverlap(referenceProduct.sizes, candidateProduct.sizes)
    }));
  }

  normalizeString(str) {
    if (!str) return '';
    return str.toString().toLowerCase().trim();
  }

  materialsMatch(mat1, mat2) {
    if (!mat1 || !mat2) return false;
    const normalized1 = this.normalizeString(mat1);
    const normalized2 = this.normalizeString(mat2);
    return normalized1 === normalized2 || normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  colorsMatch(color1, color2) {
    if (!color1 || !color2) return false;
    return this.normalizeString(color1) === this.normalizeString(color2);
  }

  priceWithinThreshold(price1, price2) {
    if (price1 == null || price2 == null) return false;
    return Math.abs(price1 - price2) <= 500;
  }

  sizesOverlap(sizes1, sizes2) {
    if (!sizes1 || !sizes2) return false;
    const array1 = Array.isArray(sizes1) ? sizes1 : [sizes1];
    const array2 = Array.isArray(sizes2) ? sizes2 : [sizes2];
    return array1.some(size => array2.includes(size));
  }
}

module.exports = new RecommendationEngine();
