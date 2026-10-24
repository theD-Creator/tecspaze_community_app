/**
 * Local Database Service (IndexedDB fallback when Supabase is not configured)
 * This provides a simple key-value store for the app to work offline
 */

import { Post, Comment, EmployeeRating, Report, User } from '../types'

// Database name
const DB_NAME = 'tecspaze_community_db'
const DB_VERSION = 1

// Store names
const STORES = {
  POSTS: 'posts',
  COMMENTS: 'comments',
  RATINGS: 'ratings',
  REPORTS: 'reports',
  USERS: 'users',
  PROFILES: 'profiles',
}

class LocalDatabase {
  private db: IDBDatabase | null = null
  private initialized = false

  async init() {
    return new Promise<void>((resolve, reject) => {
      if (this.initialized) {
        resolve()
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Database error')
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.POSTS)) {
          db.createObjectStore(STORES.POSTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.COMMENTS)) {
          db.createObjectStore(STORES.COMMENTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.RATINGS)) {
          db.createObjectStore(STORES.RATINGS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.REPORTS)) {
          db.createObjectStore(STORES.REPORTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          db.createObjectStore(STORES.PROFILES, { keyPath: 'id' })
        }
      }
    })
  }

  private getStore(storeName: string, mode: 'readonly' | 'readwrite' = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction(storeName, mode).objectStore(storeName)
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.POSTS)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve([])
    })
  }

  async getPost(id: string): Promise<Post | null> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.POSTS)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  async createPost(post: Post): Promise<Post> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.POSTS, 'readwrite')
      const request = store.put(post)
      request.onsuccess = () => resolve(post)
      request.onerror = () => resolve(post)
    })
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
    await this.init()
    return new Promise((resolve) => {
      this.getPost(id).then((post) => {
        if (!post) {
          resolve(null)
          return
        }
        const updatedPost = { ...post, ...updates }
        const store = this.getStore(STORES.POSTS, 'readwrite')
        const request = store.put(updatedPost)
        request.onsuccess = () => resolve(updatedPost)
        request.onerror = () => resolve(post)
      })
    })
  }

  async deletePost(id: string): Promise<boolean> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.POSTS, 'readwrite')
      const request = store.delete(id)
      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    })
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.COMMENTS)
      const request = store.getAll()
      request.onsuccess = () => {
        const allComments = request.result
        const postComments = allComments.filter((c) => c.postId === postId && !c.parentId)
        resolve(postComments)
      }
      request.onerror = () => resolve([])
    })
  }

  async getComment(id: string): Promise<Comment | null> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.COMMENTS)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  async createComment(comment: Comment): Promise<Comment> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.COMMENTS, 'readwrite')
      const request = store.put(comment)
      request.onsuccess = () => resolve(comment)
      request.onerror = () => resolve(comment)
    })
  }

  async deleteComment(id: string): Promise<boolean> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.COMMENTS, 'readwrite')
      const request = store.delete(id)
      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    })
  }

  // Ratings
  async getRatings(employeeId: string): Promise<EmployeeRating[]> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.RATINGS)
      const request = store.getAll()
      request.onsuccess = () => {
        const allRatings = request.result
        const employeeRatings = allRatings.filter((r) => r.employeeId === employeeId)
        resolve(employeeRatings)
      }
      request.onerror = () => resolve([])
    })
  }

  async getUserRating(employeeId: string, userId: string): Promise<EmployeeRating | null> {
    await this.init()
    return new Promise((resolve) => {
      this.getRatings(employeeId).then((ratings) => {
        const userRating = ratings.find((r) => r.userId === userId && r.employeeId === employeeId)
        resolve(userRating || null)
      })
    })
  }

  async createRating(rating: EmployeeRating): Promise<EmployeeRating> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.RATINGS, 'readwrite')
      const request = store.put(rating)
      request.onsuccess = () => resolve(rating)
      request.onerror = () => resolve(rating)
    })
  }

  async updateRating(id: string, updates: Partial<EmployeeRating>): Promise<EmployeeRating | null> {
    await this.init()
    return new Promise((resolve) => {
      this.getRating(id).then((rating) => {
        if (!rating) {
          resolve(null)
          return
        }
        const updatedRating = { ...rating, ...updates }
        const store = this.getStore(STORES.RATINGS, 'readwrite')
        const request = store.put(updatedRating)
        request.onsuccess = () => resolve(updatedRating)
        request.onerror = () => resolve(rating)
      })
    })
  }

  async getRating(id: string): Promise<EmployeeRating | null> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.RATINGS)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  async deleteRating(id: string): Promise<boolean> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.RATINGS, 'readwrite')
      const request = store.delete(id)
      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    })
  }

  // Reports
  async createReport(report: Report): Promise<Report> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.REPORTS, 'readwrite')
      const request = store.put(report)
      request.onsuccess = () => resolve(report)
      request.onerror = () => resolve(report)
    })
  }

  // Profiles
  async getProfile(id: string): Promise<User | null> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.PROFILES)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  async createProfile(profile: User): Promise<User> {
    await this.init()
    return new Promise((resolve) => {
      const store = this.getStore(STORES.PROFILES, 'readwrite')
      const request = store.put(profile)
      request.onsuccess = () => resolve(profile)
      request.onerror = () => resolve(profile)
    })
  }

  async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
    await this.init()
    return new Promise((resolve) => {
      this.getProfile(id).then((profile) => {
        if (!profile) {
          resolve(null)
          return
        }
        const updatedProfile = { ...profile, ...updates }
        const store = this.getStore(STORES.PROFILES, 'readwrite')
        const request = store.put(updatedProfile)
        request.onsuccess = () => resolve(updatedProfile)
        request.onerror = () => resolve(profile)
      })
    })
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.init()
    return new Promise((resolve) => {
      if (!this.db) {
        resolve()
        return
      }

      const transaction = this.db.transaction(
        Object.values(STORES),
        'readwrite'
      )

      Object.values(STORES).forEach((storeName) => {
        transaction.objectStore(storeName).clear()
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => resolve()
    })
  }
}

// Singleton instance
export const localDb = new LocalDatabase()

export default localDb
