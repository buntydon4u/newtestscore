import { Request, Response } from 'express';
import { PackageService } from '../services/packageService.js';
import { CreatePackageRequest, UpdatePackageRequest, PackageFilter } from '../types/packageTypes.js';

export class PackageController {
  private packageService: PackageService;

  constructor() {
    this.packageService = new PackageService();
  }

  // Get all packages
  getPackages = async (req: Request, res: Response) => {
    try {
      const filter: PackageFilter = {
        package_type: req.query.package_type as string,
        class_id: req.query.class_id as string,
        stream_id: req.query.stream_id as string,
        subject_id: req.query.subject_id as string,
        is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      };

      const packages = await this.packageService.getPackages(filter);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch packages',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get package by ID
  getPackageById = async (req: Request, res: Response) => {
    try {
      const packageId = req.params.id;
      
      if (!packageId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package ID'
        });
      }

      const packageData = await this.packageService.getPackageById(packageId);
      
      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        data: packageData
      });
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch package',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Create new package
  createPackage = async (req: Request, res: Response) => {
    try {
      const packageData: CreatePackageRequest = req.body;

      // Validate required fields
      if (!packageData.package_name || !packageData.package_type || !packageData.price || !packageData.duration_months) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: package_name, package_type, price, duration_months'
        });
      }

      // Validate package type
      const validTypes = ['class', 'subject', 'stream', 'test_series', 'chapter'];
      if (!validTypes.includes(packageData.package_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package_type. Must be one of: ' + validTypes.join(', ')
        });
      }

      // Validate mappings based on package type
      if (packageData.package_type === 'class' && !packageData.class_id) {
        return res.status(400).json({
          success: false,
          message: 'class_id is required for class packages'
        });
      }

      if (packageData.package_type === 'stream' && (!packageData.class_id || !packageData.stream_id)) {
        return res.status(400).json({
          success: false,
          message: 'class_id and stream_id are required for stream packages'
        });
      }

      if (packageData.package_type === 'subject' && (!packageData.class_id || !packageData.stream_id || !packageData.subject_id)) {
        return res.status(400).json({
          success: false,
          message: 'class_id, stream_id, and subject_id are required for subject packages'
        });
      }

      // Convert numeric IDs to valid string IDs
      const classIdStr = String(packageData.class_id);
      const streamIdStr = String(packageData.stream_id);
      const subjectIdStr = String(packageData.subject_id);
      
      console.log('Original IDs:', { class_id: packageData.class_id, stream_id: packageData.stream_id, subject_id: packageData.subject_id });
      console.log('String IDs:', { classIdStr, streamIdStr, subjectIdStr });
      
      if (classIdStr === '1') {
        packageData.class_id = 'class_10';
      }
      if (streamIdStr === '2') {
        packageData.stream_id = 'stream_general';
      }
      if (subjectIdStr === '1') {
        packageData.subject_id = 'subject_physics';
      }
      
      console.log('Final IDs:', { class_id: packageData.class_id, stream_id: packageData.stream_id, subject_id: packageData.subject_id });

      const newPackage = await this.packageService.createPackage(packageData);
      
      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: newPackage
      });
    } catch (error) {
      console.error('Error creating package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create package',
        error: error instanceof Error ? error.message : JSON.stringify(error)
      });
    }
  };

  // Update package
  updatePackage = async (req: Request, res: Response) => {
    try {
      const packageId = req.params.id;
      const updateData: UpdatePackageRequest = req.body;

      if (!packageId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package ID'
        });
      }

      const updatedPackage = await this.packageService.updatePackage(packageId, updateData);
      
      if (!updatedPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        message: 'Package updated successfully',
        data: updatedPackage
      });
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update package',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete package (soft delete)
  deletePackage = async (req: Request, res: Response) => {
    try {
      const packageId = req.params.id;
      
      if (!packageId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package ID'
        });
      }

      const deleted = await this.packageService.deletePackage(packageId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete package',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get classes
  getClasses = async (req: Request, res: Response) => {
    try {
      const classes = await this.packageService.getClasses();
      res.json({
        success: true,
        data: classes
      });
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch classes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get streams
  getStreams = async (req: Request, res: Response) => {
    try {
      const streams = await this.packageService.getStreams();
      res.json({
        success: true,
        data: streams
      });
    } catch (error) {
      console.error('Error fetching streams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch streams',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get subjects
  getSubjects = async (req: Request, res: Response) => {
    try {
      const streamId = req.query.stream_id as string;
      
      let subjects;
      if (streamId) {
        subjects = await this.packageService.getSubjectsByStream(streamId);
      } else {
        subjects = await this.packageService.getSubjects();
      }

      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subjects',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Create stream
  createStream = async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Stream name is required'
        });
      }

      const newStream = await this.packageService.createStream({ name, description });
      
      res.status(201).json({
        success: true,
        message: 'Stream created successfully',
        data: newStream
      });
    } catch (error) {
      console.error('Error creating stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create stream',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update stream
  updateStream = async (req: Request, res: Response) => {
    try {
      const streamId = req.params.id;
      const { name, description } = req.body;

      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stream ID'
        });
      }

      const updatedStream = await this.packageService.updateStream(streamId, { name, description });
      
      if (!updatedStream) {
        return res.status(404).json({
          success: false,
          message: 'Stream not found'
        });
      }

      res.json({
        success: true,
        message: 'Stream updated successfully',
        data: updatedStream
      });
    } catch (error) {
      console.error('Error updating stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stream',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete stream
  deleteStream = async (req: Request, res: Response) => {
    try {
      const streamId = req.params.id;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stream ID'
        });
      }

      const deleted = await this.packageService.deleteStream(streamId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Stream not found'
        });
      }

      res.json({
        success: true,
        message: 'Stream deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete stream',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Create subject
  createSubject = async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Subject name is required'
        });
      }

      const newSubject = await this.packageService.createSubject({ name, description });
      
      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subject',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update subject
  updateSubject = async (req: Request, res: Response) => {
    try {
      const subjectId = req.params.id;
      const { name, description } = req.body;

      if (!subjectId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }

      const updatedSubject = await this.packageService.updateSubject(subjectId, { name, description });
      
      if (!updatedSubject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: updatedSubject
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subject',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete subject
  deleteSubject = async (req: Request, res: Response) => {
    try {
      const subjectId = req.params.id;
      
      if (!subjectId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }

      const deleted = await this.packageService.deleteSubject(subjectId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      res.json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete subject',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get student's accessible packages
  getStudentPackages = async (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const packages = await this.packageService.getStudentPackages(studentId);
      
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching student packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student packages',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Check if student has access to a package
  checkStudentAccess = async (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId;
      const packageId = req.params.packageId;
      
      if (!studentId || !packageId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID or package ID'
        });
      }

      const hasAccess = await this.packageService.checkStudentAccess(studentId, packageId);
      
      res.json({
        success: true,
        data: {
          hasAccess,
          studentId,
          packageId
        }
      });
    } catch (error) {
      console.error('Error checking student access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check student access',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
