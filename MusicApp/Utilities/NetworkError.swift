//
//  NetworkError.swift
//  MusicApp
//
//  Created on 1/5/26.
//

import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case encodingError
    case serverError(Int)
    case unauthorized
    case forbidden
    case notFound
    case networkUnavailable
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to decode response"
        case .encodingError:
            return "Failed to encode request"
        case .serverError(let code):
            return "Server error: \(code)"
        case .unauthorized:
            return "Unauthorized. Please log in again."
        case .forbidden:
            return "Access forbidden"
        case .notFound:
            return "Resource not found"
        case .networkUnavailable:
            return "Network unavailable. Please check your connection."
        case .unknown(let error):
            return error.localizedDescription
        }
    }
}

